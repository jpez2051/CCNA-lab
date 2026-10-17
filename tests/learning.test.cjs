const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const c=vm.createContext({});for(const f of ['network-model','course-data','assessment-bank','assessment-extension','practicals','advanced-practicals','learning-lab'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+f+'.js'),'utf8'),c);
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
 assert.equal(new Set(bank.map(q=>q.id)).size,100);
 for(const f of ['A','B'])for(let n=0;n<20;n++){const form=makeAssessment(f);assert.equal(form.length,20);assert.deepEqual([1,2,3,4,5].map(d=>form.filter(q=>q.objective.startsWith(d+'.')).length),[5,5,4,4,2]);for(const q of form){const original=bank.find(x=>x.id===q.id);assert.equal(q.options[q.answer],original.options[original.answer]);assert(blueprint.some(x=>x[0]===q.objective));}}
});
test('learning normalization bounds data, rejects invalid exams, preserves valid pending answers',()=>{
 const qs=makeAssessment('A'),started=1000,e={form:'A',started,deadline:started+1800000,items:qs.map(q=>({id:q.id,order:[2,1,0]})),answers:{[qs[0].id]:1}};
 const l=normalizeLearning({read:['devices','devices','bad'],notes:{scope:'hello'},exam:e});assert.equal(l.read.length,1);assert.equal(l.exam.answers[qs[0].id],1);assert.equal(l.notes.scope,'hello');
 assert.equal(normalizeLearning({exam:{...e,deadline:0}}).exam,null);assert.equal(normalizeLearning({exam:{...e,items:e.items.map(x=>({...x,id:qs[0].id}))}}).exam,null);
});
const {newExam,normalizeExam,scoreExam,advancedModels,practicals}=vm.runInContext('({newExam,normalizeExam,scoreExam,advancedModels,practicals})',c);
test('100-item form has unique items, all top-level objectives and exact domain weights',()=>{
 const e=newExam('F',{},1000);assert.equal(e.items.length,100);assert.equal(e.deadline-e.started,120*60000);assert.equal(new Set(e.items.map(x=>x.id)).size,100);
 const result=scoreExam(e);assert.deepEqual(Array.from(result.domains,x=>x.total),[25,25,20,20,10]);assert.equal(result.unanswered,100);assert.equal(result.correct,0);
 assert.equal(new Set(bank.map(q=>q.objective)).size,blueprint.length);
 for(const q of bank){assert(q.options.length>=3);assert.equal(new Set(q.options).size,q.options.length);assert(q.answer>=0&&q.answer<q.options.length);assert(q.explanation.length>30);assert(q.error);}
});
test('full form preserves prior pilot exposure, permutation and every answer through reload',()=>{
 const exposed=Object.fromEntries(bank.filter(q=>q.form==='A').map(q=>[q.id,1])),e=newExam('F',exposed,5000);
 assert.equal(e.priorIds.length,20);assert(e.repeated);e.position=99;e.flags=[e.items[0].id,e.items[99].id];
 for(const q of bank)e.answers[q.id]=q.answer;
 const restored=normalizeExam(JSON.parse(JSON.stringify(e)));assert.equal(restored.position,99);assert.equal(restored.flags.length,2);assert.equal(scoreExam(restored).correct,100);
 for(const x of restored.items){const q=bank.find(q=>q.id===x.id);assert.deepEqual(Array.from(x.order).sort(),Array.from(q.options,(_,i)=>i).sort());}
 const normalized=normalizeLearning({records:[{kind:'assessment',responses:e.answers}],exam:e});assert.equal(Object.keys(normalized.records[0].responses).length,100);
});
test('scoring rejects unanswered and wrong responses, preserves fourth-option keys',()=>{
 const e=newExam('F',{},1000),q=bank.find(q=>q.id==='v140-C36');assert.equal(q.answer,3);e.answers[q.id]=3;
 assert.equal(scoreExam(e).correct,1);e.answers[q.id]=2;assert.equal(scoreExam(e).correct,0);e.answers[q.id]=99;assert.equal(normalizeExam(e).answers[q.id],undefined);
});
test('invalid sessions cannot enlarge a deadline, substitute items or duplicate option indices',()=>{
 const e=newExam('F',{},1000);assert.equal(normalizeExam({...e,deadline:e.deadline+1}),null);
 const copy=JSON.parse(JSON.stringify(e));copy.items[0].order=[0,0,1];assert.equal(normalizeExam(copy),null);
 copy.items[0]=null;assert.equal(normalizeExam(copy),null);assert.equal(normalizeExam({...e,form:'Z'}),null);
 const old=newExam('A',{},1000);delete old.flags;delete old.priorIds;delete old.position;assert.equal(normalizeExam(old).position,0);
});
test('advanced models require all outcomes and accept alternative valid LACP activation',()=>{
 for(const spec of Object.values(advancedModels))assert(spec.verify(spec.initial).some(x=>!x.ok));
 for(const [left,right,expected]of [['passive','passive',false],['active','passive',true],['passive','active',true],['active','active',true]])assert.equal(advancedModels.lacp.verify({left,right})[0].ok,expected);
 const ospf=advancedModels.ospf;assert(ospf.verify({area:'0',passive:'no',advertise:'yes'}).every(x=>x.ok));assert(!ospf.verify({area:'0',passive:'no',advertise:'no'})[1].ok);
 assert(!advancedModels.pat.verify({subnet:'192.168.10.0/24',service:'stopped'})[1].ok);
 assert(!advancedModels.acl.verify({order:'deny-first',attached:'no'})[0].ok);assert(advancedModels.acl.verify({order:'deny-first',attached:'yes'}).every(x=>x.ok));
});
test('advanced recipes carry explicit topology, fault, configuration and verification instructions',()=>{
 assert.equal(practicals.length,12);for(const p of practicals.slice(6)){assert(p.gear&&p.fault&&p.verify&&p.independent&&p.config);assert(p.objectives.every(id=>blueprint.some(x=>x[0]===id)));assert(p.source.startsWith('https://www.cisco.com/'));}
});
