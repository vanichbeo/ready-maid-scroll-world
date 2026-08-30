import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const value = (name) => {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) throw new Error(`Missing ${name}`);
  return args[i + 1];
};

const leasePath = value("--lease");
const outPath = value("--out");
const lease = JSON.parse(fs.readFileSync(leasePath, "utf8"));

if (!lease?.ok || lease?.terminal) throw new Error("Lease is not active");
if (String(lease.action).toUpperCase() !== "RELINK") throw new Error(`Unsupported action: ${lease.action}`);

const targetUrl = String(lease.target_url || "");
const targetLabelRaw = String(lease.target_label || "Related Ready Maid guide");
const targetPageType = String(lease.target_page_type || "guide");
const candidates = Array.isArray(lease.candidates) ? lease.candidates : [];

if (!targetUrl.startsWith("/") || !targetUrl.endsWith("/")) throw new Error("Invalid target URL");
if (!candidates.length) throw new Error("No deterministic source candidates");

const protectedFiles = new Set([
  "index.html",
  "script.js",
  "styles.css",
  "config/meet-duke-baseline.json",
  "refund-policy/index.html",
  "fees-payment-replacement-policy/index.html"
]);

const htmlPathFor = (urlPath) => urlPath === "/" ? "index.html" : `${urlPath.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
const esc = (s) => s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const label = targetLabelRaw.replace(/\s*\|\s*Ready Maid.*$/i, "").trim() || "Related Ready Maid guide";
const typeLabel = targetPageType === "location" ? "Location" : targetPageType === "authority" ? "Guide" : "Guide";

let chosen = null;

for (const candidate of candidates) {
  const sourceUrl = String(candidate.source_url || "");
  if (!sourceUrl.startsWith("/") || !sourceUrl.endsWith("/")) continue;
  const file = htmlPathFor(sourceUrl);
  if (protectedFiles.has(file) || !fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, "utf8");
  if (html.includes(`href="${targetUrl}"`)) continue;

  const re = /<div class="related-grid">([\s\S]*?)<\/div><\/section>/;
  const match = html.match(re);
  if (!match) continue;

  const card = `<a class="related-card" href="${esc(targetUrl)}"><span class="related-type">${typeLabel}</span><strong>${esc(label)}</strong><span>Read this page</span></a>`;
  const replacement = `<div class="related-grid">${match[1]}${card}</div></section>`;
  const updated = html.replace(re, replacement);

  if (updated === html) continue;
  fs.writeFileSync(file, updated, "utf8");
  chosen = {
    source_url: sourceUrl,
    target_url: targetUrl,
    source_file: file,
    source_page_id: candidate.source_page_id,
    anchor_text: label,
    candidate_score: candidate.score
  };
  break;
}

if (!chosen) throw new Error("No safe source file with an existing related-grid could be modified deterministically");

fs.writeFileSync(outPath, JSON.stringify(chosen, null, 2) + "\n", "utf8");
console.log(JSON.stringify(chosen));
