import fs from 'node:fs';

const fail = (message) => {
  console.error(`SEO DEPLOYMENT BLOCKED: ${message}`);
  // Vercel ignoreCommand semantics: exit 0 = ignore this deployment.
  process.exit(0);
};

const pass = () => {
  console.log('SEO deployment guard PASS — Meet DUKE baseline preserved.');
  // Vercel ignoreCommand semantics: exit 1 = continue deployment.
  process.exit(1);
};

const mustRead = (path) => {
  if (!fs.existsSync(path)) fail(`missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
};

const index = mustRead('index.html');
const script = mustRead('script.js');
const sitemap = mustRead('sitemap.xml');
const refund = mustRead('refund-policy/index.html');
const fees = mustRead('fees-payment-replacement-policy/index.html');

const requiredIndexMarkers = [
  'id="meet-duke-production-lock"',
  'id="duke"',
  'class="duke-klcc-hero"',
  'class="duke-klcc-frame"',
  'class="duke-video-grid duke-klcc-grid"',
  'class="duke-video-modal"',
  'experience-vs-no-experience.mp4',
  'repeated-instructions.mp4',
  'housework-interview-question.mp4',
  'quiet-helper-warning.mp4',
  'interview-performance.mp4',
  'first-interview-question.mp4'
];

for (const marker of requiredIndexMarkers) {
  if (!index.includes(marker)) fail(`Meet DUKE marker removed or changed: ${marker}`);
}

const videoCardCount = (index.match(/class="duke-video-card"/g) || []).length;
if (videoCardCount !== 6) fail(`expected exactly 6 Meet DUKE video cards, found ${videoCardCount}`);

const videoSrcCount = (index.match(/data-video-src=/g) || []).length;
if (videoSrcCount !== 6) fail(`expected exactly 6 Meet DUKE video sources, found ${videoSrcCount}`);

const requiredScriptMarkers = [
  'MEET DUKE',
  "document.querySelector('.duke-video-modal')",
  "document.querySelectorAll('.duke-video-open')",
  '/refund-policy/',
  '/fees-payment-replacement-policy/'
];
for (const marker of requiredScriptMarkers) {
  if (!script.includes(marker)) fail(`required production behavior missing from script.js: ${marker}`);
}

if (!refund.includes('Refund &amp; Cancellation Policy') && !refund.includes('Refund & Cancellation Policy')) {
  fail('refund-policy page no longer contains the approved refund policy heading');
}
if (!fees.includes('RM14,999')) fail('fees policy lost Standard Package RM14,999 reference');

for (const url of [
  'https://readymaid.my/refund-policy/',
  'https://readymaid.my/fees-payment-replacement-policy/'
]) {
  if (!sitemap.includes(url)) fail(`sitemap missing required URL: ${url}`);
}

const sitemapCount = (sitemap.match(/<url>/g) || []).length;
if (sitemapCount < 27) fail(`SEO sitemap regressed below 27 URLs; found ${sitemapCount}`);

pass();
