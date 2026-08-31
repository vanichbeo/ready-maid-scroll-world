import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const i = args.indexOf(name);
  if (i < 0 || i + 1 >= args.length) throw new Error(`Missing ${name}`);
  return args[i + 1];
};

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const stableJson = (v) => {
  if (Array.isArray(v)) return "[" + v.map(stableJson).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stableJson(v[k])).join(",") + "}";
  return JSON.stringify(v);
};
const esc = (s) => String(s)
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#39;");

const protectedSlugs = new Set([
  "/",
  "/about-ready-maid/",
  "/fees-payment-replacement-policy/",
  "/licence-company-verification/"
]);

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function validateEnvelope(envelope) {
  assert(envelope && typeof envelope === "object", "CREATE renderer requires a contract envelope");
  assert(envelope.status === "validated", "CREATE contract status must be validated");
  assert(envelope.schema_version === "create-content-v1", "Unsupported CREATE contract schema");
  assert(/^[a-f0-9]{64}$/.test(String(envelope.contract_hash || "")), "Validated contract_hash required");
  assert(typeof envelope.contract_canonical === "string" && envelope.contract_canonical.length > 0, "Canonical CREATE contract required");
  assert(sha256(envelope.contract_canonical) === envelope.contract_hash, "CREATE contract hash mismatch");
  let canonicalContract;
  try { canonicalContract = JSON.parse(envelope.contract_canonical); }
  catch { throw new Error("Canonical CREATE contract is not valid JSON"); }
  assert(stableJson(canonicalContract) === stableJson(envelope.contract), "CREATE contract payload does not match canonical contract");
  assert(envelope.validation?.validated === true, "CREATE contract validation evidence missing");
  assert(envelope.validation?.exact_render_text_present === true, "Exact render text validation missing");
  assert(envelope.validation?.protected_surface_ok === true, "Protected-surface validation missing");
  assert(envelope.validation?.claim_sources_verified === true, "Claim-source validation missing");
  assert(envelope.validation?.cta_bound_to_conversion_destination === true, "CTA binding validation missing");
  assert(envelope.validation?.slug_bound_to_action_decision === true, "Slug binding validation missing");
  assert(envelope.contract && typeof envelope.contract === "object", "CREATE contract payload missing");
  return envelope;
}

function loadEnvelope(file) {
  return validateEnvelope(JSON.parse(fs.readFileSync(file, "utf8")));
}

function safePathForSlug(outRoot, slug) {
  assert(/^\/[a-z0-9][a-z0-9/-]*\/$/.test(slug), "Invalid CREATE slug");
  assert(!slug.startsWith("/.seo-test/"), "Test slug forbidden in production renderer");
  assert(!protectedSlugs.has(slug), "Protected slug forbidden");
  const rel = path.join(slug.replace(/^\//, "").replace(/\/$/, ""), "index.html");
  const root = path.resolve(outRoot);
  const dest = path.resolve(root, rel);
  assert(dest.startsWith(root + path.sep), "CREATE output escaped output root");
  return dest;
}

function schemaGraph(c, canonical) {
  const types = new Set(c.schema_types || []);
  const graph = [];
  if (types.has("WebPage")) {
    graph.push({
      "@type":"WebPage",
      "@id":canonical + "#webpage",
      "url":canonical,
      "name":c.title,
      "description":c.meta_description,
      "inLanguage":"en-MY"
    });
  }
  if (types.has("BreadcrumbList")) {
    graph.push({
      "@type":"BreadcrumbList",
      "@id":canonical + "#breadcrumb",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":"https://readymaid.my/"},
        {"@type":"ListItem","position":2,"name":c.h1,"item":canonical}
      ]
    });
  }
  if (types.has("Article")) {
    graph.push({
      "@type":"Article",
      "@id":canonical + "#article",
      "headline":c.h1,
      "description":c.meta_description,
      "mainEntityOfPage":{"@id":canonical + "#webpage"},
      "inLanguage":"en-MY"
    });
  }
  return {"@context":"https://schema.org","@graph":graph};
}

function validateRenderContract(c) {
  assert(c.schema_version === "create-content-v1", "Contract schema mismatch");
  assert(typeof c.slug === "string", "Contract slug missing");
  assert(typeof c.title === "string" && c.title.length >= 30 && c.title.length <= 70, "Invalid contract title");
  assert(typeof c.meta_description === "string" && c.meta_description.length >= 90 && c.meta_description.length <= 170, "Invalid contract meta description");
  assert(typeof c.h1 === "string" && c.h1.length >= 20 && c.h1.length <= 110, "Invalid contract h1");
  assert(typeof c.direct_answer === "string" && c.direct_answer.length >= 80 && c.direct_answer.length <= 700, "Invalid direct answer");
  assert(typeof c.cta_target === "string" && /^\/[a-z0-9][a-z0-9/-]*\/$/.test(c.cta_target), "Invalid CTA target");
  assert(typeof c.cta_label === "string" && c.cta_label.length >= 3 && c.cta_label.length <= 80, "Invalid CTA label");
  assert(Array.isArray(c.sections) && c.sections.length >= 4 && c.sections.length <= 12, "Invalid sections");
  assert(Array.isArray(c.faq) && c.faq.length <= 6, "Invalid FAQ");
  assert(Array.isArray(c.internal_links) && c.internal_links.length >= 2 && c.internal_links.length <= 8, "Invalid internal links");
  assert(Array.isArray(c.claims), "Invalid claims");
  assert(Array.isArray(c.schema_types), "Invalid schema types");
  for (const s of c.sections) {
    assert(typeof s.heading === "string" && s.heading.trim().length >= 4, "Invalid section heading");
    assert(typeof s.body === "string" && s.body.trim().length >= 80, "Invalid exact section body");
  }
  for (const f of c.faq) {
    assert(typeof f.question === "string" && f.question.trim().length >= 8, "Invalid FAQ question");
    assert(typeof f.answer_brief === "string" && f.answer_brief.trim().length >= 20, "Invalid FAQ answer");
  }
  for (const l of c.internal_links) {
    assert(typeof l.url === "string" && /^\/[a-z0-9][a-z0-9/-]*\/$/.test(l.url), "Invalid internal link URL");
    assert(typeof l.anchor === "string" && l.anchor.trim().length >= 3, "Invalid internal link anchor");
  }
  for (const cl of c.claims) {
    assert(typeof cl.claim === "string" && cl.claim.trim().length >= 10, "Invalid claim text");
    assert(["locked_knowledge","official_authority"].includes(String(cl.source_type)), "Invalid claim source type");
    assert(typeof cl.source_ref === "string" && cl.source_ref.trim().length > 0, "Invalid claim source ref");
  }
  const allowedSchema = new Set(["WebPage","BreadcrumbList","Article"]);
  assert(c.schema_types.includes("WebPage") && c.schema_types.includes("BreadcrumbList"), "Required schema missing");
  if (c.page_type === "guide") assert(c.schema_types.includes("Article"), "Guide Article schema missing");
  for (const t of c.schema_types) assert(allowedSchema.has(t), "Unsupported schema type");
}

function verifyRenderedOutput(html, c, canonical) {
  assert(html.includes(`<title>${esc(c.title)}</title>`), "Rendered title mismatch");
  assert(html.includes(`<meta name="description" content="${esc(c.meta_description)}">`), "Rendered meta description mismatch");
  assert(html.includes(`<h1>${esc(c.h1)}</h1>`), "Rendered H1 mismatch");
  assert(html.includes(`<a class="cta" href="${esc(c.cta_target)}">${esc(c.cta_label)}</a>`), "Rendered CTA mismatch");
  assert(html.includes(`<link rel="canonical" href="${esc(canonical)}">`), "Rendered canonical mismatch");
  for (const s of c.sections) assert(html.includes(esc(s.body)), "Rendered section body mismatch");
  for (const f of c.faq) assert(html.includes(esc(f.question)) && html.includes(esc(f.answer_brief)), "Rendered FAQ mismatch");
  for (const l of c.internal_links) assert(html.includes(`href="${esc(l.url)}"`) && html.includes(esc(l.anchor)), "Rendered internal link mismatch");
  for (const cl of c.claims) assert(html.includes(esc(cl.claim)), "Rendered claim mismatch");
  assert(!/<script(?! type="application\/ld\+json")/i.test(html), "Unexpected executable script in CREATE output");
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert(schemaMatch, "Rendered JSON-LD missing");
  const graph = JSON.parse(schemaMatch[1]);
  const renderedTypes = new Set((graph["@graph"] || []).map((x) => x["@type"]));
  for (const t of c.schema_types) assert(renderedTypes.has(t), `Rendered schema type missing: ${t}`);
  for (const t of renderedTypes) assert(c.schema_types.includes(t), `Unapproved rendered schema type: ${t}`);
}

function listFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const p=path.join(dir,entry.name);
      if (entry.isDirectory()) walk(p); else out.push(p);
    }
  };
  if (fs.existsSync(root)) walk(root);
  return out;
}

function render(envelope, outRoot) {
  validateEnvelope(envelope);
  const c = envelope.contract;
  validateRenderContract(c);
  const dest = safePathForSlug(outRoot, c.slug);
  assert(!fs.existsSync(dest), "CREATE destination already exists");

  const canonical = `https://readymaid.my${c.slug}`;
  const sections = c.sections.map((s) =>
    `<section class="section"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`
  ).join("");

  const faq = c.faq.length
    ? `<section class="section"><h2>Frequently asked questions</h2>${c.faq.map((f) =>
        `<h3>${esc(f.question)}</h3><p>${esc(f.answer_brief)}</p>`
      ).join("")}</section>`
    : "";

  const claims = c.claims.length
    ? `<section class="section"><h2>Verified information used on this page</h2><ul>${c.claims.map((cl) =>
        `<li>${esc(cl.claim)}</li>`
      ).join("")}</ul></section>`
    : "";

  const related = `<section class="section"><h2>Related Ready Maid pages</h2><ul>${c.internal_links.map((l) =>
    `<li><a href="${esc(l.url)}">${esc(l.anchor)}</a></li>`
  ).join("")}</ul></section>`;

  const jsonLd = JSON.stringify(schemaGraph(c, canonical)).replaceAll("<","\\u003c");
  const html = `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.meta_description)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${esc(canonical)}">
<script type="application/ld+json">${jsonLd}</script>
<style>
:root{--bg:#06142a;--panel:#0a1d3a;--line:#204b77;--text:#eef7ff;--muted:#a9bfd6;--cyan:#56e7ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.68 Arial,sans-serif}
.wrap{max-width:980px;margin:auto;padding:40px 20px 72px}.hero,.section{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:30px;margin:18px 0}
h1{font-size:clamp(2rem,5vw,4rem);line-height:1.05;margin:0 0 20px}h2{color:var(--cyan);margin-top:0}h3{margin-bottom:8px}
p,li{color:#dce9f6}.direct{font-size:1.14rem}.cta{display:inline-block;margin-top:12px;padding:12px 18px;border:1px solid var(--cyan);border-radius:999px;color:var(--text);text-decoration:none;font-weight:700}
a{color:var(--cyan)}
</style>
</head>
<body>
<main class="wrap">
<section class="hero"><h1>${esc(c.h1)}</h1><p class="direct">${esc(c.direct_answer)}</p><a class="cta" href="${esc(c.cta_target)}">${esc(c.cta_label)}</a></section>
${sections}
${faq}
${claims}
${related}
</main>
</body>
</html>
`;

  verifyRenderedOutput(html, c, canonical);
  fs.mkdirSync(path.dirname(dest), {recursive:true});
  fs.writeFileSync(dest, html, "utf8");
  return {
    action:"CREATE",
    verify_kind:"page",
    target_url:c.slug,
    target_file:path.relative(path.resolve(outRoot), dest).replaceAll(path.sep,"/"),
    contract_hash:envelope.contract_hash,
    output_sha256:sha256(html),
    expected_title:c.title,
    expected_meta_description:c.meta_description,
    expected_h1:c.h1,
    expected_cta_target:c.cta_target,
    section_count:c.sections.length,
    faq_count:c.faq.length,
    internal_link_count:c.internal_links.length,
    claim_count:c.claims.length,
    schema_types:[...c.schema_types]
  };
}

function selfTest() {
  const contract = {
    schema_version:"create-content-v1",
    slug:"/guides/phase3d-renderer-proof/",
    page_type:"guide",
    title:"Practical Domestic Helper Planning Guide Malaysia",
    meta_description:"A practical guide for Malaysian households to define domestic helper priorities, interview needs and next steps before making an agency enquiry.",
    h1:"Planning Your Domestic Helper Needs in Malaysia",
    direct_answer:"Start by defining the household duties, care priorities, daily routine and communication expectations before comparing helper profiles or arranging interviews.",
    sections:[
      {heading:"Define the main household priority",purpose:"Identify the primary reason for hiring before comparing candidates.",body:"Write down the household's main need first, such as child care, elderly support, cooking or general housework. This keeps interviews focused on relevant experience instead of broad claims."},
      {heading:"Separate essential and secondary duties",purpose:"Distinguish must-have responsibilities from teachable duties.",body:"List duties that must be handled confidently from day one, then separate tasks that can be learned after arrival. This makes candidate comparisons more consistent and easier to explain."},
      {heading:"Prepare practical interview questions",purpose:"Use consistent questions about experience and routine.",body:"Ask every shortlisted candidate the same practical questions about past duties, household routines, communication and willingness to follow instructions. Compare answers with the available biodata."},
      {heading:"Plan the next step with the agency",purpose:"Organize requirements before making an enquiry.",body:"Keep the household priorities, preferred experience and key interview questions together before contacting the agency. A clear brief makes the matching conversation more efficient and specific."}
    ],
    faq:[{question:"Should I choose nationality first?",answer_brief:"No. Start with the household need, relevant experience and ability to follow the family routine."}],
    internal_links:[
      {url:"/guides/helper-interview-questions/",anchor:"helper interview questions"},
      {url:"/contact-ready-maid/",anchor:"contact Ready Maid"}
    ],
    cta_target:"/contact-ready-maid/",
    cta_label:"Contact Ready Maid",
    claims:[
      {claim:"Ready Maid offers Indonesian and Philippine domestic helper matching.",risk:"business_fact",source_type:"locked_knowledge",source_ref:"services.core"}
    ],
    schema_types:["WebPage","BreadcrumbList","Article"]
  };
  const canonical = JSON.stringify(contract);
  const base = {
    status:"validated",
    schema_version:"create-content-v1",
    contract_hash:sha256(canonical),
    contract_canonical:canonical,
    validation:{
      validated:true,
      exact_render_text_present:true,
      protected_surface_ok:true,
      claim_sources_verified:true,
      cta_bound_to_conversion_destination:true,
      slug_bound_to_action_decision:true
    },
    contract
  };

  const rootA=fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-a-"));
  const rootB=fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-b-"));
  const tempRoots=[rootA,rootB];
  const results={};
  const expectBlocked=(name,fn)=>{
    let blocked=false;
    try { fn(); } catch { blocked=true; }
    assert(blocked,`${name} was not blocked`);
    results[name]=true;
  };
  try {
    const ra=render(base,rootA);
    const rb=render(base,rootB);
    assert(ra.output_sha256===rb.output_sha256,"Renderer is not deterministic");
    results.deterministic=true;

    const files=listFiles(rootA);
    assert(files.length===1,"Renderer created extra output files");
    assert(path.basename(files[0])==="index.html","Renderer output filename changed");
    results.one_file_only=true;

    const rendered=fs.readFileSync(files[0],"utf8");
    assert(rendered.includes(esc(contract.sections[0].body)),"Approved section body missing");
    assert(rendered.includes(esc(contract.claims[0].claim)),"Approved claim missing");
    assert(!rendered.includes(contract.sections[0].purpose),"Planning purpose leaked into page");
    results.exact_contract_text=true;

    expectBlocked("duplicate_slug_blocked",()=>render(base,rootA));

    const badSchema=structuredClone(base);
    badSchema.contract.schema_types.push("FAQPage");
    expectBlocked("malformed_schema_blocked",()=>render(badSchema,fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-schema-"))));

    const badLink=structuredClone(base);
    badLink.contract.internal_links[0].url="https://evil.example/";
    expectBlocked("invalid_internal_link_blocked",()=>render(badLink,fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-link-"))));

    const changedClaim=structuredClone(base);
    changedClaim.contract.claims[0].claim="This unapproved claim was injected after validation.";
    expectBlocked("unapproved_claim_blocked",()=>render(changedClaim,fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-claim-"))));

    const changedCta=structuredClone(base);
    changedCta.contract.cta_target="/fees-payment-replacement-policy/";
    expectBlocked("changed_cta_blocked",()=>render(changedCta,fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-cta-"))));

    for (const key of ["title","meta_description","h1"]) {
      const changed=structuredClone(base);
      changed.contract[key]=changed.contract[key]+" changed after validation";
      expectBlocked(`changed_${key}_blocked`,()=>render(changed,fs.mkdtempSync(path.join(os.tmpdir(),`seo-create-3d-${key}-`))));
    }

    const protectedSlug=structuredClone(base);
    protectedSlug.contract.slug="/";
    protectedSlug.contract_canonical=JSON.stringify(protectedSlug.contract);
    protectedSlug.contract_hash=sha256(protectedSlug.contract_canonical);
    expectBlocked("protected_surface_blocked",()=>render(protectedSlug,fs.mkdtempSync(path.join(os.tmpdir(),"seo-create-3d-protected-"))));

    const superseded=structuredClone(base);
    superseded.status="superseded";
    expectBlocked("unvalidated_contract_blocked",()=>validateEnvelope(superseded));

    const tamperedHtml=rendered.replace(
      `<meta name="description" content="${esc(contract.meta_description)}">`,
      '<meta name="description" content="tampered">'
    );
    expectBlocked("rendered_output_tamper_blocked",()=>verifyRenderedOutput(tamperedHtml,contract,`https://readymaid.my${contract.slug}`));

    const executableScript=rendered.replace("</body>","<script>alert(1)</script></body>");
    expectBlocked("unexpected_script_blocked",()=>verifyRenderedOutput(executableScript,contract,`https://readymaid.my${contract.slug}`));

    console.log(JSON.stringify({ok:true,...results,output_sha256:ra.output_sha256}));
  } finally {
    for (const root of tempRoots) fs.rmSync(root,{recursive:true,force:true});
  }
}

if (flag("--self-test")) {
  selfTest();
} else {
  const contractPath = value("--contract");
  const outRoot = value("--out-root");
  const resultPath = value("--result");
  const envelope = loadEnvelope(contractPath);
  const result = render(envelope,outRoot);
  fs.writeFileSync(resultPath,JSON.stringify(result,null,2)+"\n","utf8");
  console.log(JSON.stringify(result));
}
