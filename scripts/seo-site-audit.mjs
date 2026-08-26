import fs from 'node:fs';
import path from 'node:path';

const errors = [];
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>https:\/\/readymaid\.my([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
const uniqueUrls = new Set(urls);

if (urls.length !== uniqueUrls.size) errors.push('sitemap contains duplicate URLs');
if (urls.length < 27) errors.push(`sitemap must contain at least 27 URLs; found ${urls.length}`);

const htmlPathFor = (urlPath) => urlPath === '/' ? 'index.html' : `${urlPath.replace(/^\//, '').replace(/\/$/, '')}/index.html`;

const attr = (html, selector) => {
  if (selector === 'canonical') {
    return html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i)?.[1]
      || html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"[^>]*>/i)?.[1]
      || null;
  }
  if (selector === 'description') {
    return html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1]
      || html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i)?.[1]
      || null;
  }
  return null;
};

const localAssetPath = (value, htmlFile) => {
  if (!value || /^(https?:|data:|blob:|mailto:|tel:|#)/i.test(value)) return null;
  const clean = value.split(/[?#]/)[0];
  if (!clean) return null;
  return clean.startsWith('/')
    ? clean.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(htmlFile), clean));
};

for (const urlPath of urls) {
  const file = htmlPathFor(urlPath);
  if (!exists(file)) {
    errors.push(`sitemap target missing: ${urlPath} -> ${file}`);
    continue;
  }
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = attr(html, 'description')?.trim();
  const canonical = attr(html, 'canonical');
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"[^>]*>/i)?.[1]
    || html.match(/<meta[^>]*content="([^"]+)"[^>]*name="robots"[^>]*>/i)?.[1]
    || '';

  if (!title) errors.push(`${urlPath}: missing title`);
  if (!description) errors.push(`${urlPath}: missing meta description`);
  if (canonical !== `https://readymaid.my${urlPath}`) errors.push(`${urlPath}: canonical mismatch (${canonical || 'missing'})`);
  if (h1Count !== 1) errors.push(`${urlPath}: expected one H1; found ${h1Count}`);
  if (/noindex/i.test(robots)) errors.push(`${urlPath}: sitemap page is noindex`);
  if (/Helpful Guides Draft|ready-maid-master-logo\.png/i.test(html)) errors.push(`${urlPath}: draft or removed asset reference remains`);

  for (const match of html.matchAll(/\s(?:src|poster)="([^"]+)"/gi)) {
    const asset = localAssetPath(match[1], file);
    if (asset && !exists(asset)) errors.push(`${urlPath}: missing local asset ${asset}`);
  }

  for (const match of html.matchAll(/<a[^>]*class="[^"]*related-card[^"]*"[^>]*href="([^"]+)"/gi)) {
    const target = new URL(match[1], `https://readymaid.my${urlPath}`).pathname;
    if (target === urlPath) errors.push(`${urlPath}: related-card self-link`);
  }

  if (urlPath.startsWith('/guides/') && urlPath !== '/guides/' && !html.includes('application/ld+json')) {
    errors.push(`${urlPath}: missing structured data`);
  }
}

if (errors.length) {
  console.error('SEO SITE AUDIT FAILED:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO site audit PASS — ${urls.length} unique sitemap URLs, metadata, canonicals, H1s, local assets and guide links verified.`);
