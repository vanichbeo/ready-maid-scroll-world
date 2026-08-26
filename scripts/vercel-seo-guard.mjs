import fs from 'node:fs';
import crypto from 'node:crypto';

const mode = process.argv.includes('--ci') ? 'ci' : process.argv.includes('--self-test') ? 'self-test' : 'vercel';
const baseline = JSON.parse(fs.readFileSync('config/meet-duke-baseline.json', 'utf8'));

const sha256 = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

const readRequired = (path) => {
  if (!fs.existsSync(path)) throw new Error(`missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
};

const extractBlock = (text, startMarker, endMarker, label) => {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`missing ${label} start marker`);
  const endStart = text.indexOf(endMarker, start);
  if (endStart < 0) throw new Error(`missing ${label} end marker`);
  return text.slice(start, endStart + endMarker.length);
};

const extractDukeSection = (index) => {
  const match = index.match(/<section[^>]*id="duke"[^>]*>/);
  if (!match || match.index === undefined) throw new Error('missing Meet DUKE section');
  const end = index.indexOf('</section>', match.index);
  if (end < 0) throw new Error('missing Meet DUKE section closing tag');
  return index.slice(match.index, end + '</section>'.length);
};

export const validateMeetDuke = ({ index, script, sitemap, refund, fees }) => {
  const errors = [];
  const capture = (fn) => {
    try { fn(); } catch (error) { errors.push(error.message); }
  };

  capture(() => {
    const style = extractBlock(index, '<style id="meet-duke-production-lock">', '</style>', 'Meet DUKE style');
    if (sha256(style) !== baseline.hashes.meetDukeStyle) errors.push('Meet DUKE protected style hash changed');
  });

  capture(() => {
    const section = extractDukeSection(index);
    if (sha256(section) !== baseline.hashes.meetDukeSection) errors.push('Meet DUKE protected DOM hash changed');
    const cards = (section.match(/class="duke-video-card"/g) || []).length;
    const sources = (section.match(/data-video-src=/g) || []).length;
    if (cards !== baseline.expected.videoCards) errors.push(`expected ${baseline.expected.videoCards} Meet DUKE cards; found ${cards}`);
    if (sources !== baseline.expected.videoSources) errors.push(`expected ${baseline.expected.videoSources} Meet DUKE sources; found ${sources}`);
    for (const file of baseline.expected.videoFiles) {
      if (!section.includes(file)) errors.push(`missing protected Meet DUKE video: ${file}`);
    }
  });

  if (sha256(script) !== baseline.hashes.scriptJs) errors.push('protected script.js hash changed');

  if (!refund.includes('Refund &amp; Cancellation Policy') && !refund.includes('Refund & Cancellation Policy')) {
    errors.push('refund-policy page lost the approved heading');
  }
  if (!fees.includes('RM14,999')) errors.push('fees policy lost Standard Package RM14,999');
  for (const url of [
    'https://readymaid.my/refund-policy/',
    'https://readymaid.my/fees-payment-replacement-policy/'
  ]) {
    if (!sitemap.includes(url)) errors.push(`sitemap missing required URL: ${url}`);
  }
  const sitemapCount = (sitemap.match(/<url>/g) || []).length;
  if (sitemapCount < 27) errors.push(`sitemap regressed below 27 URLs; found ${sitemapCount}`);

  return errors;
};

const files = {
  index: readRequired('index.html'),
  script: readRequired('script.js'),
  sitemap: readRequired('sitemap.xml'),
  refund: readRequired('refund-policy/index.html'),
  fees: readRequired('fees-payment-replacement-policy/index.html')
};

if (mode === 'self-test') {
  const cases = [
    ['style mutation', { ...files, index: files.index.replace('margin-top:16px', 'margin-top:17px') }],
    ['DOM mutation', { ...files, index: files.index.replace('class="duke-video-card"', 'class="duke-video-card-removed"') }],
    ['script mutation', { ...files, script: files.script.replace('MEET DUKE', 'MEET DUKE REMOVED') }],
    ['video mutation', { ...files, index: files.index.replace('experience-vs-no-experience.mp4', 'missing-video.mp4') }]
  ];
  const missed = cases.filter(([, mutated]) => validateMeetDuke(mutated).length === 0).map(([name]) => name);
  if (missed.length) {
    console.error(`Meet DUKE guard self-test FAILED: ${missed.join(', ')} was not blocked`);
    process.exit(1);
  }
  console.log(`Meet DUKE guard self-test PASS — ${cases.length} injected regressions blocked.`);
  process.exit(0);
}

const errors = validateMeetDuke(files);
if (errors.length) {
  console.error('SEO DEPLOYMENT BLOCKED:');
  for (const error of errors) console.error(`- ${error}`);
  // CI uses conventional exit codes. Vercel ignoreCommand uses exit 0 to skip.
  process.exit(mode === 'ci' ? 1 : 0);
}

console.log('SEO deployment guard PASS — cryptographic Meet DUKE baseline preserved.');
// CI uses conventional exit codes. Vercel ignoreCommand uses exit 1 to continue.
process.exit(mode === 'ci' ? 0 : 1);
