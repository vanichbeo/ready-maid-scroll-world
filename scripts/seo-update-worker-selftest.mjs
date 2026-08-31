import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const worker = path.join(here, "seo-deterministic-worker.mjs");
const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");

function runCase(name, metaTag) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `seo-update-${name}-`));
  const pageDir = path.join(root, "guides", "test");
  fs.mkdirSync(pageDir, { recursive: true });
  const before = `<!doctype html><html><head><title>Original SEO Test Page Title</title>${metaTag}</head><body><h1>Fixture</h1></body></html>\n`;
  const pagePath = path.join(pageDir, "index.html");
  fs.writeFileSync(pagePath, before, "utf8");

  const lease = {
    ok: true,
    terminal: false,
    action: "UPDATE",
    target_url: "/guides/test/",
    target_page_id: "00000000-0000-0000-0000-000000000001",
    update_patch: {
      mode: "metadata",
      expected_file_sha256: sha256(before),
      title: "Updated SEO Test Page Title",
      meta_description: "Updated metadata description used only for deterministic UPDATE self-testing."
    }
  };
  const leasePath = path.join(root, "lease.json");
  const outPath = path.join(root, "out.json");
  fs.writeFileSync(leasePath, JSON.stringify(lease), "utf8");

  const r = spawnSync(process.execPath, [worker, "--lease", leasePath, "--out", outPath], {
    cwd: root,
    encoding: "utf8"
  });
  if (r.status !== 0) throw new Error(`${name} failed: ${r.stderr || r.stdout}`);

  const after = fs.readFileSync(pagePath, "utf8");
  const result = JSON.parse(fs.readFileSync(outPath, "utf8"));
  if (!after.includes("<title>Updated SEO Test Page Title</title>")) throw new Error(`${name}: title not updated`);
  if (!after.includes('<meta name="description" content="Updated metadata description used only for deterministic UPDATE self-testing.">')) throw new Error(`${name}: description not updated`);
  if (result.action !== "UPDATE" || result.verify_kind !== "metadata") throw new Error(`${name}: wrong result contract`);
  if (result.before_sha256 !== sha256(before) || result.after_sha256 !== sha256(after)) throw new Error(`${name}: hash evidence mismatch`);
}


function runStaleHashRefusalCase() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "seo-update-stale-hash-"));
  const pageDir = path.join(root, "guides", "test");
  fs.mkdirSync(pageDir, { recursive: true });
  const before = '<!doctype html><html><head><title>Original SEO Test Page Title</title><meta name="description" content="Original description for fixture testing only."></head><body><h1>Fixture</h1></body></html>\n';
  const pagePath = path.join(pageDir, "index.html");
  fs.writeFileSync(pagePath, before, "utf8");

  const lease = {
    ok: true,
    terminal: false,
    action: "UPDATE",
    target_url: "/guides/test/",
    target_page_id: "00000000-0000-0000-0000-000000000002",
    update_patch: {
      mode: "metadata",
      expected_file_sha256: "0".repeat(64),
      title: "Updated SEO Test Page Title",
      meta_description: "Updated metadata description used only for deterministic UPDATE self-testing."
    }
  };
  const leasePath = path.join(root, "lease.json");
  const outPath = path.join(root, "out.json");
  fs.writeFileSync(leasePath, JSON.stringify(lease), "utf8");

  const r = spawnSync(process.execPath, [worker, "--lease", leasePath, "--out", outPath], {
    cwd: root,
    encoding: "utf8"
  });

  if (r.status === 0) throw new Error("stale-hash: worker unexpectedly succeeded");
  const combined = `${r.stderr || ""}\n${r.stdout || ""}`;
  if (!combined.includes("UPDATE source hash mismatch; re-research required")) {
    throw new Error(`stale-hash: wrong refusal reason: ${combined}`);
  }
  const after = fs.readFileSync(pagePath, "utf8");
  if (after !== before) throw new Error("stale-hash: fixture was modified despite refusal");
  if (fs.existsSync(outPath)) throw new Error("stale-hash: result file was created despite refusal");
  console.log("SEO UPDATE stale-hash refusal PASS");
}

runCase("name-first", '<meta name="description" content="Original description for fixture testing only.">');
runCase("content-first", '<meta content="Original description for fixture testing only." name="description">');
runStaleHashRefusalCase();
console.log("SEO UPDATE self-test PASS");
