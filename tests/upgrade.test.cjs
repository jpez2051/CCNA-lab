const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c=vm.createContext({});
for(const f of ['network-model','course-data','assessment-bank','assessment-extension','assessment-revision','practicals','advanced-practicals','learning-lab','study-path'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../'+f+'.js'),'utf8'),c);
const api=vm.runInContext('({assessmentBank,revisedBank,newExam,scoreExam,normalizeExam,normalizeLearning,learningNext,reviewSchedule,skillCase,courseStages})',c);
test('recognition and correct choices cannot place a beginner beyond teaching',()=>{
 const l=api.normalizeLearning({read:api.courseStages.map(u=>u.id),records:api.courseStages.map(u=>({kind:'transfer',unit:u.id,correct:true,at:new Date().toISOString()}))});assert.equal(api.learningNext(l).id,'devices');
 assert.equal(api.learningNext(api.normalizeLearning({...l,resumeStage:'addresses'})).id,'addresses');
});
test('revised forms retain legacy sessions and disclose source-item exposure',()=>{
 const old=api.newExam('F',{},1000),e=api.newExam('R',Object.fromEntries(old.items.map(x=>[x.id,1])),1000);assert.equal(e.items.length,100);assert.equal(e.priorIds.length,100);assert(e.repeated);
 assert(api.normalizeExam(old));assert(api.normalizeExam(e));assert(e.items.every(x=>!old.items.some(y=>y.id===x.id)));
 for(const x of e.items)e.answers[x.id]=api.assessmentBank.find(q=>q.id===x.id).answer;
 assert.equal(api.scoreExam(api.normalizeExam(e)).correct,100);
 assert.deepEqual(Array.from(api.scoreExam(e).domains,d=>d.total),[25,25,20,20,10]);
 for(const q of api.revisedBank){assert(q.options[q.answer]);assert.equal(q.options.length,new Set(q.options).size);assert(q.explanation);}
});
test('answer keys preserve numerical and protocol evidence after revision',()=>{
 const get=id=>api.revisedBank.find(q=>q.id==='v150-'+id),answer=id=>get(id).options[get(id).answer];
 assert.equal(answer('C06'),'/26');assert.equal(answer('C07'),'10.12.5.191');assert.match(answer('C08'),/130.*190/);assert.equal(answer('C36'),'120');
 assert.equal(answer('C29'),'Root guard');assert.equal(answer('C30'),'Loop guard');assert.match(answer('C31'),/B:.*24/);assert.equal(answer('C32'),'Administrative distance');assert.equal(answer('C52'),'Implicit final deny');
 const longest=api.revisedBank.filter(q=>q.options.every((o,i)=>i===q.answer||o.length<q.options[q.answer].length)).length;
 const shortest=api.revisedBank.filter(q=>q.options.every((o,i)=>i===q.answer||o.length>q.options[q.answer].length)).length;
 assert(longest<40,'longest-option cue: '+longest);assert(shortest<40,'shortest-option cue: '+shortest);
});
test('project migration and archived attempts survive normalization',()=>{
 const e=api.newExam('F',{},1000);e.submitted=1100;
 const l=api.normalizeLearning({notes:{scope:'Original'},projects:[{id:'p1',title:'First',notes:{scope:'Separate'}}],activeProject:'p1',examHistory:[e]});
 assert.equal(l.notes.scope,'Original');assert.equal(l.projects[0].notes.scope,'Separate');assert.equal(l.activeProject,'p1');assert.equal(l.examHistory.length,1);
});
test('spaced review extends only with successful attempts on separate days',()=>{
 const day=86400000,start=Date.parse('2026-01-01T00:00:00Z'),r=at=>({kind:'transfer',unit:'devices',at:new Date(at).toISOString(),correct:true,helped:false});
 let l={records:[r(start),r(start+1000)]};assert.equal(api.reviewSchedule(l,'devices',start+day).days,2);
 l.records.push(r(start+3*day));assert.equal(api.reviewSchedule(l,'devices',start+4*day).days,7);
 l.records.push({...r(start+4*day),correct:false});assert.equal(api.reviewSchedule(l,'devices',start+5*day).days,1);
});
test('all teaching stages have valid case variants and subnet answers agree with arithmetic',()=>{
 for(const u of api.courseStages)for(const random of [()=>0,()=>0.45,()=>0.99]){const x=api.skillCase(u.id,random);assert.equal(x.items.length,2);for(const q of x.items){assert(q.options[q.answer]);assert(q.why.length>25);}}
 for(const n of [0,0.45,0.99]){const x=api.skillCase('addresses',()=>n);const address=x.story.match(/Client ([\d.]+)\/(\d+)/);const m=vm.runInContext('NetworkModel',c);assert.equal(x.items[0].options[x.items[0].answer],m.subnet(address[1],address[2]).network);}
});
