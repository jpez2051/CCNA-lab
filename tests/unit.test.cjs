const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function load(raw = null) {
  let stored = raw;
  const context = vm.createContext({localStorage: {
    getItem: () => stored, setItem: (_,v) => {stored=v;}, removeItem: () => {stored=null;}
  }});
  for (const file of ['curriculum.js','foundations.js','lab-engine.js','progress-store.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  const api = vm.runInContext('({LabSession,maskPrefix,ProgressStore,lessons,quizBank})',context);
  return {...api,stored:()=>stored};
}
function run(session,commands) { return commands.map(c=>session.run(c)); }
test('curriculum sequencing and stable question identity',()=>{
  const {lessons,quizBank}=load();
  assert.equal(lessons.length,23); assert.equal(quizBank.length,23);
  assert.equal(new Set(quizBank.map(q=>q.id)).size,23);
  assert.equal(lessons[2].id,'cli0');
  assert.equal(lessons.find(l=>l.id==='r1').lab,null);
});
test('verification before configuring and a wrong final hostname cannot pass',()=>{
  const {LabSession}=load();const s=new LabSession('l1');
  run(s,['enable','show running-config','conf t','hostname SW1','hostname WRONG','end']);
  assert.equal(s.complete,false);assert.equal(s.checklist[2],false);
  run(s,['conf t','hostname SW1','end']);assert.equal(s.complete,false);
  s.run('show running-config');assert.equal(s.complete,true);
  run(s,['conf t','hostname WRONG','end']);assert.equal(s.complete,false);
});
test('valid exit navigation can complete Lab 1',()=>{
  const {LabSession}=load();const s=new LabSession('l1');
  run(s,['enable','conf t','hostname SW1','exit','show running-config']);assert.equal(s.complete,true);
});
test('VLAN rename invalidates target and verification',()=>{
  const {LabSession}=load();const s=new LabSession('l2');
  run(s,['enable','conf t','vlan 10','name USERS','exit','vlan 20','name VOICE','end','show vlan brief']);assert.equal(s.complete,true);
  run(s,['conf t','vlan 20','name WRONG','end','show vlan brief']);assert.equal(s.complete,false);
  run(s,['conf t','vlan 20','name VOICE','end']);assert.equal(s.complete,false);
  s.run('show vlan brief');assert.equal(s.complete,true);
});
test('all IPv4 prefix lengths are computed, malformed masks and addresses rejected',()=>{
  const {maskPrefix,LabSession}=load();
  for(let prefix=0;prefix<=32;prefix++){
    const binary='1'.repeat(prefix)+'0'.repeat(32-prefix);
    const mask=[0,8,16,24].map(i=>parseInt(binary.slice(i,i+8),2)).join('.');
    assert.equal(maskPrefix(mask),prefix);
  }
  assert.equal(maskPrefix('255.0.255.0'),null);
  assert.equal(maskPrefix('256.255.0.0'),null);
  const s=new LabSession('l3');run(s,['enable','conf t']);
  for(const cmd of ['ip route 10.0.0.0 255.0.255.0 1.1.1.1','ip route 10.0.0.1 255.255.255.0 1.1.1.1','ip route 999.0.0.0 255.0.0.0 1.1.1.1']){
    assert.match(s.run(cmd),/^%/);
  }
  assert.equal(s.routes.length,0);
  run(s,['ip route 192.168.99.0 255.255.255.0 192.168.1.2','end']);
  assert.match(s.run('show ip route'),/192\.168\.99\.0\/24/);assert.equal(s.complete,false);
});
test('static route must be present and inspected after changes',()=>{
  const {LabSession}=load();const s=new LabSession('l3');
  run(s,['enable','conf t','ip route 10.20.0.0 255.255.0.0 192.168.1.2','end','show ip route']);assert.equal(s.complete,true);
  run(s,['conf t','no ip route 10.20.0.0 255.255.0.0 192.168.1.2','end','show ip route']);assert.equal(s.complete,false);
});
test('OSPF correction requires fresh verification and does not claim neighbors',()=>{
  const {LabSession}=load();const s=new LabSession('l4');
  run(s,['enable','conf t','router ospf 1','router-id 1.1.1.1','network 10.0.0.0 0.0.0.255 area 0','end','show ip ospf']);assert.equal(s.complete,true);
  run(s,['conf t','router ospf 1','router-id 2.2.2.2','end']);
  assert.match(s.run('show ip ospf'),/No neighbor adjacency/);assert.equal(s.complete,false);
});
test('ACL completion and removal reflect current configuration',()=>{
  const {LabSession}=load();const s=new LabSession('l5');
  run(s,['enable','conf t','access-list 10 permit 192.168.10.0 0.0.0.255','end']);
  assert.match(s.run('show access-lists'),/not applied to an interface/);assert.equal(s.complete,true);
  run(s,['conf t','no access-list 10','end','show access-lists']);assert.equal(s.complete,false);
});
test('unsupported real IOS commands are not falsely identified as invalid IOS',()=>{
  const {LabSession}=load();const s=new LabSession('l1');s.run('enable');
  assert.match(s.run('show ip interface brief'),/may be valid on real IOS/);
});
test('legacy migration preserves reads and archives unreliable scores and labs',async()=>{
  const api=load(JSON.stringify({done:['f1','cli0','f1'],labsDone:['l1'],quizTotal:100,quizCorrect:100}));
  const p=await api.ProgressStore.load();
  assert.deepEqual(Array.from(p.done),['f1','cli0']);assert.equal(p.labsDone.length,0);
  assert.equal(p.legacyLabsDone[0],'l1');assert.equal(p.legacy.quizTotal,100);assert.equal(Object.keys(p.questions).length,0);
  await api.ProgressStore.save(p);
  const reloaded=await api.ProgressStore.load();assert.equal(reloaded.legacyLabsDone[0],'l1');
});
test('new evidence survives reload and corrupt progress is not overwritten',async()=>{
  const api=load();const p=await api.ProgressStore.load();
  p.labEvidence.l1={validationVersion:'1.1.4',completedAt:'2026-09-28',guided:true};
  await api.ProgressStore.save(p);assert.equal((await api.ProgressStore.load()).labsDone[0],'l1');
  const bad=load('{broken');await assert.rejects(bad.ProgressStore.load());
  await assert.rejects(bad.ProgressStore.save(p));assert.equal(bad.stored(),'{broken');
  await bad.ProgressStore.clear();await bad.ProgressStore.save(p);assert.equal((await bad.ProgressStore.load()).labsDone[0],'l1');
});
test('adapter writes are serialized and snapshots cannot mutate while queued',async()=>{
  const {ProgressStore}=load(),written=[];let finish;
  ProgressStore.use({load:async()=>null,save:async p=>{if(!written.length)await new Promise(r=>{finish=r});written.push(p.done[0]);},clear:async()=>{}});
  const p=ProgressStore.normalize(null);p.done=['f1'];const a=ProgressStore.save(p);
  p.done=['f2'];const b=ProgressStore.save(p);
  await new Promise(r=>setImmediate(r));finish();await Promise.all([a,b]);
  assert.deepEqual(written,['f1','f2']);
});
