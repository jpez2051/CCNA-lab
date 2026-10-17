const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const c=vm.createContext({});for(const f of ['network-model','course-data','assessment-bank','practicals','learning-lab'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+f+'.js'),'utf8'),c);
const {NetworkModel:m,assessmentBank:bank,makeAssessment,normalizeLearning,blueprint}=vm.runInContext('({NetworkModel,assessmentBank,makeAssessment,normalizeLearning,blueprint})',c);
test('IPv4 subnet boundaries across octets and special prefixes',()=>{
 assert.equal(m.subnet('172.16.35.9',20).network,'172.16.32.0');assert.equal(m.subnet('172.16.35.9',20).last,'172.16.47.255');
 assert.equal(m.subnet('255.255.255.255',0).network,'0.0.0.0');assert.equal(m.subnet('10.0.0.0',31).hosts,2);assert.equal(m.subnet('10.0.0.1',32).hosts,1);
 for(const a of ['1.2.3','256.0.0.1','1.2.-1.4','1.2.3.NaN'])assert.throws(()=>m.ip(a));for(const p of [-1,33,2.5])assert.throws(()=>m.subnet('1.2.3.4',p));
});
test('local and remote outcomes distinguish all injected faults',()=>{
 const healthy=m.topology(25);for(const k of ['peer','gateway','dns','server','web'])assert.equal(m.probe(healthy,k).ok,true,k);
 const faults={gateway:'192.0.2.1',prefix:0,dns:'192.0.2.53',clientLink:false,returnRoute:false,service:false,record:false};
 for(const [key,value] of Object.entries(faults)){const s={...healthy,[key]:value};assert.equal(m.probe(s,'web').ok,false,key);if(key!=='clientLink')assert.equal(m.probe(s,'peer').ok,true,key+' preserves local test');}
 assert.equal(m.probe({...healthy,service:false},'server').ok,true);assert.equal(m.probe({...healthy,record:false},'server').ok,true);
 assert.equal(m.probe({...healthy,returnRoute:false},'web').reason,'return-route');assert.equal(m.probe({...healthy,prefix:0},'server').reason,'mask');
});
test('route matching uses most specific prefix before AD and handles no match',()=>{
 const routes=[{network:'10.0.0.0',prefix:8,next:'A',ad:1,metric:0},{network:'10.2.0.0',prefix:16,next:'B',ad:120,metric:10}];
 assert.equal(m.route('10.2.3.4',routes).next,'B');assert.equal(m.route('10.3.3.4',routes).next,'A');assert.equal(m.route('192.0.2.1',routes),null);
});
test('pilot forms have distinct IDs and published domain proportions with valid shuffled answers',()=>{
 assert.equal(new Set(bank.map(q=>q.id)).size,40);
 for(const f of ['A','B'])for(let n=0;n<20;n++){const form=makeAssessment(f);assert.equal(form.length,20);assert.deepEqual([1,2,3,4,5].map(d=>form.filter(q=>q.objective.startsWith(d+'.')).length),[5,5,4,4,2]);for(const q of form){const original=bank.find(x=>x.id===q.id);assert.equal(q.options[q.answer],original.options[original.answer]);assert(blueprint.some(x=>x[0]===q.objective));}}
});
test('learning normalization bounds data, rejects invalid exams, preserves valid pending answers',()=>{
 const qs=makeAssessment('A'),started=1000,e={form:'A',started,deadline:started+1800000,items:qs.map(q=>({id:q.id,order:[2,1,0]})),answers:{[qs[0].id]:1}};
 const l=normalizeLearning({read:['devices','devices','bad'],notes:{scope:'hello'},exam:e});assert.equal(l.read.length,1);assert.equal(l.exam.answers[qs[0].id],1);assert.equal(l.notes.scope,'hello');
 assert.equal(normalizeLearning({exam:{...e,deadline:0}}).exam,null);assert.equal(normalizeLearning({exam:{...e,items:e.items.map(x=>({...x,id:qs[0].id}))}}).exam,null);
});
