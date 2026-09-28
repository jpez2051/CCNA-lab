const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../foundations.js'),'utf8'),context);
const {foundationScenario,gradeFoundation,normalizeFoundations,foundationEscape}=vm.runInContext('({foundationScenario,gradeFoundation,normalizeFoundations,foundationEscape})',context);
function answers(s){return {...Object.fromEntries(s.fields.map(([key,,value])=>[key,value])),...(s.choice?{choice:String(s.choice.a)}:{}),...(s.secondChoice?{secondChoice:String(s.secondChoice.a)}:{})};}
test('generated scenarios accept complete correct answers and reject wrong or missing answers',()=>{
  for(const unit of ['journey','settings','subnets','triage']){
    for(let n=0;n<30;n++){
      const s=foundationScenario(unit);assert.equal(gradeFoundation(s,answers(s)).correct,true);assert.equal(gradeFoundation(s,{}).correct,false);
      const a=answers(s);a[Object.keys(a)[0]]='wrong';assert.equal(gradeFoundation(s,a).correct,false);
    }
  }
});
test('subnet scenario answers match independent bitwise arithmetic across all supported prefixes',()=>{
  for(let prefix=24;prefix<=29;prefix++){
    for(let boundary=0;boundary<2**(prefix-24);boundary++){
      const sequence=[0.3,(prefix-24+0.1)/6,(boundary+0.1)/2**(prefix-24),0.6];
      // Generator consumes an unused host pick before selecting the prefix.
      sequence.splice(1,0,0.2);
      const s=foundationScenario('subnets',()=>sequence.shift());
      const [address,prefixText]=s.summary.split('/');assert.equal(Number(prefixText),prefix);
      const ip=address.split('.').reduce((a,n)=>(a*256+Number(n))>>>0,0),mask=(0xffffffff<<(32-prefix))>>>0;
      const network=(ip&mask)>>>0,broadcast=(network|(~mask>>>0))>>>0;
      const dotted=n=>[24,16,8,0].map(shift=>(n>>>shift)&255).join('.');
      const a=answers(s);
      assert.equal(a.network,dotted(network));assert.equal(a.broadcast,dotted(broadcast));
      assert.equal(a.first,dotted(network+1));assert.equal(a.last,dotted(broadcast-1));assert.equal(Number(a.hosts),2**(32-prefix)-2);
    }
  }
});
test('both triage variants require end-to-end verification',()=>{
  for(const r of [0.1,0.9]){const s=foundationScenario('triage',()=>r);assert.equal(s.secondChoice.a,2);assert.equal(gradeFoundation(s,answers(s)).correct,true);}
});
test('foundation progress normalization retains notes and valid evidence, bounds history',()=>{
  const p=normalizeFoundations({read:['journey','bad','journey'],notes:{journey:'<script>example</script>'},attempts:Array.from({length:105},()=>({unit:'subnets',version:'1.2.0',correct:true,helpUsed:false,summary:'example'}))});
  assert.equal(p.read.length,1);assert.equal(p.attempts.length,100);assert.equal(p.notes.journey,'<script>example</script>');
  assert.equal(foundationEscape(p.notes.journey),'&lt;script&gt;example&lt;/script&gt;');
  assert.equal(normalizeFoundations(null).read.length,0);
});
