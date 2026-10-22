const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c=vm.createContext({});vm.runInContext("const VERSION='1.5.1';",c);
for(const f of ['network-model','assessment-bank','assessment-extension','assessment-revision','lab-packages','quality-workspace'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+f+'.js'),'utf8'),c);
const {labPackages,labRunTemplate,labBuildSheet,reviewerPackage,normalizeQuality,summarizePilotAttempts,questionSnapshot,revisedBank,NetworkModel}=vm.runInContext('({labPackages,labRunTemplate,labBuildSheet,reviewerPackage,normalizeQuality,summarizePilotAttempts,questionSnapshot,revisedBank,NetworkModel})',c);
function attempt(){return {form:'R',started:1000,repeated:false,priorIds:[],items:revisedBank.map(q=>({id:q.id,prompt:q.prompt,options:q.options,expected:q.answer,selected:q.answer}))};}
test('review pack covers all 100 immutable items and does not invent review evidence',()=>{
 const p=reviewerPackage();assert.equal(p.items.length,100);assert.equal(new Set(p.items.map(q=>q.id)).size,100);
 for(const x of p.items){assert.equal(x.review.decision,'pending');assert.equal(x.review.keySupported,null);assert.equal(x.review.actualEvidence,'');assert.equal(x.review.distractorRationales.length,x.options.length);}
});
test('reviews with stale question snapshots are rejected and imported prose is bounded',()=>{
 const q=revisedBank[0],r={id:q.id,snapshot:questionSnapshot(q),role:'external',decision:'supported',notes:'x'.repeat(5000)};
 const n=normalizeQuality({reviews:[r,{...r,snapshot:'old content'}]});assert.equal(n.reviews.length,1);assert.equal(n.reviews[0].notes.length,2000);assert.equal(n.reviews[0].role,'external');
});
test('pilot summaries recompute scores, reject mismatched keys and deduplicate exports',()=>{
 const a=attempt();a.items[0].selected=null;a.items[1].selected=(a.items[1].expected+1)%a.items[1].options.length;
 const r=summarizePilotAttempts([a,JSON.parse(JSON.stringify(a))]);assert.equal(r.accepted,1);assert.equal(r.duplicates,1);assert.equal(r.items.reduce((s,x)=>s+x.correct,0),98);assert.equal(r.items[0].omitted,1);
 const bad=attempt();bad.items[0].expected=(bad.items[0].expected+1)%bad.items[0].options.length;assert.throws(()=>summarizePilotAttempts([bad]),/mapping/);
 const changed=attempt();changed.items[0].prompt+=' altered';assert.throws(()=>summarizePilotAttempts([changed]),/mapping/);
 const repeated=attempt();repeated.repeated=true;assert(summarizePilotAttempts([repeated]).items.every(r=>r.priorExposure===1));
});
test('build packages provide valid nonduplicated host addresses and honest blank run reports',()=>{
 for(const p of labPackages){const ips=new Set();for(const [device,iface,ip,mask,gateway]of p.addresses){assert(!ips.has(ip));ips.add(ip);NetworkModel.ip(ip);NetworkModel.ip(mask);if(gateway!=='None'&&gateway!=='—'){const bits=NetworkModel.ip(mask).toString(2).split('1').length-1;assert(NetworkModel.local(ip,gateway,bits));}}
  const report=labRunTemplate(p);assert.equal(report.status,'not-executed');assert.equal(report.packetTracerVersion,'');assert(report.checks.every(c=>c.actual===''&&c.passed===null));assert(p.fault.action&&p.fault.repair);assert.match(labBuildSheet(p),/baseline\.pkt/);assert.match(labBuildSheet(p),/not executed/);
 }
});
test('routing package has forward and return routes and scoped policy rollback',()=>{
 const p=labPackages.find(p=>p.id==='routing-policy');assert.match(p.configs['R1.cfg'],/ip route 192\.168\.20\.0 255\.255\.255\.0 10\.0\.0\.2/);assert.match(p.configs['R2.cfg'],/ip route 192\.168\.10\.0 255\.255\.255\.0 10\.0\.0\.1/);assert.match(p.extension.config,/deny icmp host 192\.168\.10\.10 host 192\.168\.20\.10\n permit ip any any/);assert.match(p.extension.rollback,/no ip access-group LAB_POLICY in/);
});
