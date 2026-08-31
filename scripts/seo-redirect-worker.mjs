import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const args=process.argv.slice(2);
const flag=(name)=>args.includes(name);
const value=(name)=>{
  const i=args.indexOf(name);
  if(i<0||i+1>=args.length) throw new Error(`Missing ${name}`);
  return args[i+1];
};
const assert=(cond,msg)=>{if(!cond) throw new Error(msg);};

const protectedSources=new Set([
  "/",
  "/about-ready-maid/",
  "/fees-payment-replacement-policy/",
  "/licence-company-verification/"
]);

function validatePath(p,label){
  assert(typeof p==="string" && /^\/[a-z0-9][a-z0-9/-]*\/$/.test(p),`Invalid ${label}`);
  assert(!p.startsWith("/.seo-test/"),`Test ${label} forbidden`);
}

function applyRedirect(config,contract){
  const source=String(contract.source_url||"").trim();
  const destination=String(contract.destination_url||"").trim();
  validatePath(source,"source_url");
  validatePath(destination,"destination_url");
  assert(source!==destination,"Redirect source and destination must differ");
  assert(!protectedSources.has(source),"Protected source cannot be redirected");
  assert(Number(contract.redirect_code)===301,"Only permanent 301 redirects are allowed");
  assert(contract.human_approved===true,"Human approval required");

  const redirects=Array.isArray(config.redirects)?config.redirects:[];
  assert(!redirects.some(r=>r.source===source),"Redirect source already exists");
  assert(!redirects.some(r=>r.source===destination && r.destination===source),"Direct redirect loop detected");

  const next=structuredClone(config);
  next.redirects=[...redirects,{source,destination,permanent:true}];
  return next;
}

function selfTest(){
  const base={
    cleanUrls:false,
    trailingSlash:true,
    redirects:[
      {source:"/about/",destination:"/about-ready-maid/",permanent:true}
    ]
  };
  const good={
    source_url:"/guides/old-example/",
    destination_url:"/guides/helper-interview-questions/",
    redirect_code:301,
    human_approved:true
  };

  const a=applyRedirect(base,good);
  assert(a.redirects.length===2,"Redirect not added");
  assert(base.redirects.length===1,"Input config mutated");

  const expectBlocked=(name,contract,config=base)=>{
    let blocked=false;
    try{applyRedirect(config,contract);}catch{blocked=true;}
    assert(blocked,`${name} was not blocked`);
  };

  expectBlocked("protected_source",{...good,source_url:"/"});
  expectBlocked("non_301",{...good,redirect_code:302});
  expectBlocked("missing_approval",{...good,human_approved:false});
  expectBlocked("same_source_destination",{...good,destination_url:good.source_url});
  expectBlocked("duplicate_source",good,a);
  expectBlocked("external_destination",{...good,destination_url:"https://example.com/"});

  const loopConfig={redirects:[{source:good.destination_url,destination:good.source_url,permanent:true}]};
  expectBlocked("direct_loop",good,loopConfig);

  console.log(JSON.stringify({
    ok:true,
    one_file_contract:true,
    permanent_301_only:true,
    human_approval_required:true,
    protected_source_blocked:true,
    duplicate_source_blocked:true,
    direct_loop_blocked:true
  }));
}

if(flag("--self-test")){
  selfTest();
}else{
  const contractPath=value("--contract");
  const configPath=value("--config");
  const outPath=value("--out");
  const contract=JSON.parse(fs.readFileSync(contractPath,"utf8"));
  const config=JSON.parse(fs.readFileSync(configPath,"utf8"));
  const next=applyRedirect(config,contract);
  fs.writeFileSync(outPath,JSON.stringify(next,null,2)+"\n","utf8");
  console.log(JSON.stringify({
    action:"REDIRECT",
    source_url:contract.source_url,
    destination_url:contract.destination_url,
    redirect_code:301,
    target_file:path.basename(outPath)
  }));
}
