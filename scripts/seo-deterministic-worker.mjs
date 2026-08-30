import fs from "node:fs";
import crypto from "node:crypto";

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

const action = String(lease.action || "").toUpperCase();
const protectedFiles = new Set([
  "index.html",
  "script.js",
  "styles.css",
  "config/meet-duke-baseline.json",
  "refund-policy/index.html",
  "fees-payment-replacement-policy/index.html"
]);
const htmlPathFor = (urlPath) => urlPath === "/" ? "index.html" : `${urlPath.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const esc = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function relink() {
  const targetUrl = String(lease.target_url || "");
  const targetLabelRaw = String(lease.target_label || "Related Ready Maid guide");
  const targetPageType = String(lease.target_page_type || "guide");
  const candidates = Array.isArray(lease.candidates) ? lease.candidates : [];
  if (!targetUrl.startsWith("/") || !targetUrl.endsWith("/")) throw new Error("Invalid target URL");
  if (!candidates.length) throw new Error("No deterministic source candidates");

  const label = targetLabelRaw.replace(/\s*\|\s*Ready Maid.*$/i, "").trim() || "Related Ready Maid guide";
  const typeLabel = targetPageType === "location" ? "Location" : "Guide";

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
    const updated = html.replace(re, `<div class="related-grid">${match[1]}${card}</div></section>`);
    if (updated === html) continue;

    fs.writeFileSync(file, updated, "utf8");
    return {
      action:"RELINK",
      verify_kind:"link",
      source_url: sourceUrl,
      target_url: targetUrl,
      source_file: file,
      source_page_id: candidate.source_page_id,
      anchor_text: label,
      candidate_score: candidate.score
    };
  }
  throw new Error("No safe source file with an existing related-grid could be modified deterministically");
}

function updateMetadata() {
  const targetUrl = String(lease.target_url || "");
  const patch = lease.update_patch || {};
  if (!targetUrl.startsWith("/") || !targetUrl.endsWith("/") || targetUrl === "/") throw new Error("Invalid UPDATE target URL");
  if (String(patch.mode || "") !== "metadata") throw new Error("UPDATE v1 supports metadata mode only");

  const file = htmlPathFor(targetUrl);
  if (protectedFiles.has(file) || !fs.existsSync(file)) throw new Error("UPDATE target file is protected or missing");

  const before = fs.readFileSync(file, "utf8");
  const expected = String(patch.expected_file_sha256 || "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error("UPDATE requires expected_file_sha256");
  if (sha256(before) !== expected) throw new Error("UPDATE source hash mismatch; re-research required");

  const title = patch.title == null ? null : String(patch.title).trim();
  const description = patch.meta_description == null ? null : String(patch.meta_description).trim();
  if (!title && !description) throw new Error("UPDATE patch has no metadata change");
  if (title && (title.length < 20 || title.length > 90 || /[<>]/.test(title))) throw new Error("Invalid UPDATE title");
  if (description && (description.length < 50 || description.length > 180 || /[<>]/.test(description))) throw new Error("Invalid UPDATE meta description");

  let updated = before;
  if (title) {
    if (!/<title>[\s\S]*?<\/title>/i.test(updated)) throw new Error("Target page has no title");
    updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  }
  if (description) {
    const metaRe = /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i;
    if (!metaRe.test(updated)) throw new Error("Target page has no meta description");
    updated = updated.replace(metaRe, `<meta name="description" content="${esc(description)}">`);
  }
  if (updated === before) throw new Error("UPDATE produced no diff");

  fs.writeFileSync(file, updated, "utf8");
  return {
    action:"UPDATE",
    verify_kind:"metadata",
    source_url:targetUrl,
    target_url:targetUrl,
    source_file:file,
    target_page_id:lease.target_page_id,
    anchor_text:"",
    expected_title:title,
    expected_meta_description:description,
    before_sha256:expected,
    after_sha256:sha256(updated)
  };
}

let result;
if (action === "RELINK") result = relink();
else if (action === "UPDATE") result = updateMetadata();
else throw new Error(`Unsupported action: ${action}`);

fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify(result));
