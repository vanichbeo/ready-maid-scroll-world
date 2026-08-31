import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";

const args=process.argv.slice(2);
const value=(name)=>{const i=args.indexOf(name);if(i<0||i+1>=args.length)throw new Error(`Missing ${name}`);return args[i+1];};
const leasePath=value("--lease");
const outPath=value("--out");
const lease=JSON.parse(fs.readFileSync(leasePath,"utf8"));
if(!lease?.ok||lease?.terminal||String(lease.action||"").toUpperCase()!=="CREATE") throw new Error("Active CREATE lease required");

const envelope=lease.create_contract;
if(!envelope||envelope.status!=="validated") throw new Error("Validated CREATE contract envelope missing");

const temp=fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-worker-"));
const contractPath=path.join(temp,"contract.json");
const renderResultPath=path.join(temp,"render-result.json");
fs.writeFileSync(contractPath,JSON.stringify(envelope),"utf8");

execFileSync(process.execPath,[
  "scripts/seo-create-renderer.mjs",
  "--contract",contractPath,
  "--out-root",".",
  "--result",renderResultPath
],{stdio:"inherit"});

const result=JSON.parse(fs.readFileSync(renderResultPath,"utf8"));
const c=envelope.contract;
const slug=String(c.slug||"");
const canonical=`https://readymaid.my${slug}`;
if(c.page_type!=="guide") throw new Error("CREATE v1 supports guide surface sync only");

const hubPath="guides/index.html";
const sitemapPath="sitemap.xml";
let hub=fs.readFileSync(hubPath,"utf8");
let sitemap=fs.readFileSync(sitemapPath,"utf8");
if(hub.includes(`href="${slug}"`)) throw new Error("Guide hub already contains CREATE target");
if(sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error("Sitemap already contains CREATE target");

const faqCount=Array.isArray(c.faq)?c.faq.length:0;
const li=`<li><a href="${slug}">${c.h1}</a> — ${faqCount} FAQs</li>`;
const hubListMarker="</ul></section><div class=\"guide-hub-grid\">";
if(!hub.includes(hubListMarker)) throw new Error("Guide hub list marker missing");
hub=hub.replace(hubListMarker,`${li}</ul></section><div class="guide-hub-grid">`);

const card=`<a class="guide-hub-card" href="${slug}"><strong>${c.h1}</strong><span>Open guide</span></a>`;
const gridMarker='</div><section aria-label="Legal operator"';
if(!hub.includes(gridMarker)) throw new Error("Guide hub card marker missing");
hub=hub.replace(gridMarker,`${card}</div><section aria-label="Legal operator"`);

const siteMarker="</urlset>";
if(!sitemap.includes(siteMarker)) throw new Error("Sitemap closing marker missing");
sitemap=sitemap.replace(siteMarker,`  <url><loc>${canonical}</loc></url>\n</urlset>`);

fs.writeFileSync(hubPath,hub,"utf8");
fs.writeFileSync(sitemapPath,sitemap,"utf8");

execFileSync("python",["scripts/seo_surface_sync.py","--check"],{stdio:"inherit"});

const sha256=(v)=>crypto.createHash("sha256").update(v).digest("hex");
const final={
  ...result,
  source_url:result.target_url,
  source_file:result.target_file,
  anchor_text:"",
  create_verified:true,
  contract_hash:envelope.contract_hash,
  output_sha256:result.output_sha256,
  surface_files:[result.target_file,hubPath,sitemapPath],
  hub_sha256:sha256(fs.readFileSync(hubPath)),
  sitemap_sha256:sha256(fs.readFileSync(sitemapPath))
};
fs.writeFileSync(outPath,JSON.stringify(final,null,2)+"\n","utf8");
fs.rmSync(temp,{recursive:true,force:true});
console.log(JSON.stringify(final));
