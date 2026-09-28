const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), artifacts=process.env.ARTIFACT_DIR || path.join(root,'.artifacts');
fs.mkdirSync(artifacts,{recursive:true});
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}
  catch{res.writeHead(404);res.end();}
});
async function command(page,text){await page.locator('#termInput').fill(text);await page.locator('#termInput').press('Enter');}
async function noOverflow(page,name){
  const extra=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth?[]:[...document.querySelectorAll('#content *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,90),width:e.getBoundingClientRect().width})));
  assert.equal(extra.length,0,name+' overflow: '+JSON.stringify(extra));
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=process.env.TEST_URL || 'http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
  try{
    for(const width of (process.env.TEST_WIDTHS?process.env.TEST_WIDTHS.split(',').map(Number):[1440,390,320])){
      const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);await page.locator('#continueBtn').waitFor();
      assert.equal(await page.title(),'CCNA Launchpad v1.2.0');
      assert.equal(await page.locator('#streak,.streak-card').count(),0);
      assert(!/day streak|lessons mastered|knowledge-check accuracy/.test(await page.locator('body').innerText()));
      await noOverflow(page,'dashboard');
      await page.screenshot({path:path.join(artifacts,'dashboard-'+width+'.png')});
      await page.locator('#continueBtn').click();await page.locator('[data-id=f1]').click();
      await page.locator('#markDone').click();assert.equal(await page.locator('.recommended').getAttribute('data-id'),'f2');
      await page.locator('[data-id=f1]').click();
      await page.locator('input[name=q][value="0"]').check();await page.locator('#checkAnswer').click();
      for(let i=0;i<5;i++)await page.locator('#checkAnswer').evaluate(el=>el.click());
      assert.equal(await page.evaluate(()=>state.questions['f1:q1'].attempts),1);
      await page.locator('#retryAnswer').click();await page.locator('input[name=q][value="1"]').check();await page.locator('#checkAnswer').click();
      assert.deepEqual(await page.evaluate(()=>[state.questions['f1:q1'].firstCorrect,state.questions['f1:q1'].lastCorrect,state.questions['f1:q1'].attempts]),[false,true,2]);
      await page.reload();await page.locator('#continueBtn').click();await page.locator('[data-id=f1]').click();
      await page.locator('input[name=q][value="1"]').check();await page.locator('#checkAnswer').click();
      assert.equal(await page.evaluate(()=>state.questions['f1:q1'].firstCorrect),false);
      await page.locator('#backCourse').click();await page.locator('[data-id=cli0]').click();
      assert(await page.locator('#openLessonLab').isDisabled());
      await page.locator('input[name=q][value="2"]').check();await page.locator('#checkAnswer').click();
      await page.locator('#markDone').scrollIntoViewIfNeeded();const oldY=await page.evaluate(()=>scrollY);
      await page.locator('#markDone').click();
      assert(await page.locator('#openLessonLab').isEnabled());
      assert.equal(await page.locator('.next-step').count(),0);
      assert.match(await page.locator('#lessonStatus').innerText(),/now apply it in the lab/);
      assert(await page.locator('input[name=q][value="2"]').isChecked());
      assert.match(await page.locator('#result').innerText(),/Correct/);
      assert(Math.abs(await page.evaluate(()=>scrollY)-oldY)<60,'Reading position moved');
      await noOverflow(page,'lesson');
      await page.locator('#openLessonLab').click();
      assert.equal(await page.locator('.nav-btn.active').getAttribute('data-view'),'labs');
      await noOverflow(page,'lab');
      for(const text of ['enable','show running-config','conf t','hostname SW1','hostname WRONG','end'])await command(page,text);
      assert.equal(await page.locator('#labBackCourse').count(),0);
      assert.equal(await page.evaluate(()=>state.labsDone.length),0);
      for(const text of ['conf t','hostname SW1','end'])await command(page,text);
      assert.equal(await page.locator('#labBackCourse').count(),0);
      await command(page,'show running-config');await page.locator('#labBackCourse').waitFor();
      await page.screenshot({path:path.join(artifacts,'lab-'+width+'.png')});
      for(const text of ['conf t','hostname WRONG','end'])await command(page,text);
      assert.equal(await page.locator('#labBackCourse').count(),0);
      assert.match(await page.locator('#labDone').innerText(),/current attempt is not yet verified/);
      await page.locator('#labCourse').click();await page.locator('[data-id=cli0]').click();await page.locator('#markDone').click();
      assert.match(await page.locator('#lessonStatus').innerText(),/Reading and guided exercise recorded/);
      await page.locator('#backCourse').click();await noOverflow(page,'course');
      await page.screenshot({path:path.join(artifacts,'course-'+width+'.png')});
      for(const [id,commands] of Object.entries({
        l2:['enable','conf t','vlan 10','name USERS','exit','vlan 20','name VOICE','end','show vlan brief'],
        l3:['enable','conf t','ip route 10.20.0.0 255.255.0.0 192.168.1.2','end','show ip route'],
        l4:['enable','conf t','router ospf 1','router-id 1.1.1.1','network 10.0.0.0 0.0.0.255 area 0','end','show ip ospf'],
        l5:['enable','conf t','access-list 10 permit 192.168.10.0 0.0.0.255','end','show access-lists']
      })){
        await page.evaluate(id=>launchLab(id),id);
        await page.locator('#goPrereq').click();assert(await page.locator('#openLessonLab').isDisabled());
        await page.locator('#markDone').click();await page.locator('#openLessonLab').click();
        for(const text of commands)await command(page,text);
        await page.locator('#labBackCourse').waitFor();await noOverflow(page,id);
      }
      await page.reload();await page.locator('#continueBtn').waitFor();
      assert.equal(await page.evaluate(()=>state.labsDone.length),5);
      const seen=new Set();
      for(let round=0;round<(width===1440?3:1);round++){
        await page.locator('[data-view=practice]').click();
        const ids=await page.evaluate(()=>quizQuestions.map(q=>q.id));assert.equal(new Set(ids).size,10);ids.forEach(id=>seen.add(id));
        for(let i=0;i<10;i++){
          const answer=await page.evaluate(()=>quizQuestions[quizIndex].a);
          await page.locator('.quiz-option').nth(i===0?(answer+1)%4:answer).click();
          const before=await page.evaluate(()=>state.questions[quizQuestions[quizIndex].id].attempts);
          await page.locator('.quiz-option').nth(answer).evaluate(el=>el.click());
          assert.equal(await page.evaluate(()=>state.questions[quizQuestions[quizIndex].id].attempts),before);
          await page.locator('#nextQuiz').click();
        }
        assert(await page.locator('.review-lesson').count()>0);await noOverflow(page,'practice result');
      }
      if(width===1440)assert.equal(seen.size,23,'All questions must be reachable in three completed rounds');
      await page.locator('[data-view=dashboard]').click();assert(await page.locator('.review-lesson').count()>0);
      await page.locator('[data-view=roadmap]').click();assert(!/12.WEEK|Weeks 1/.test(await page.locator('#content').innerText()));
      await noOverflow(page,'roadmap');
      await page.locator('[data-view=foundations]').click();
      await page.locator('#diagnosticStart').click();
      for(let i=0;i<4;i++)await page.locator('input[name=d'+i+'][value="0"]').check();
      await page.locator('#foundationDiagnostic .btn-primary').click();
      assert.match(await page.locator('#diagnosticResult').innerText(),/review recommended/);
      await page.locator('#diagnosticContinue').click();await noOverflow(page,'workshop');
      await page.screenshot({path:path.join(artifacts,'workshop-'+width+'.png')});
      for(const id of ['journey','settings','subnets','triage']){
        await page.locator('.workshop-unit[data-unit='+id+']').click();
        if(id==='journey'){await page.locator('.path-step').nth(2).click();assert.match(await page.locator('#pathExplanation').innerText(),/gateway/);}
        await page.locator('#readFoundation').click();
        await page.locator('#foundationNote').fill('My reasoning for '+id+' <example>: distinguish an observation from a conclusion.');
        await page.locator('#saveFoundationNote').click();await page.locator('#noteStatus').filter({hasText:'Reflection saved'}).waitFor();
        await noOverflow(page,'foundation reading '+id);
        await page.locator('#challengeFoundation').click();await noOverflow(page,'scenario');
        const fill=async wrong=>{
          const s=await page.evaluate(()=>foundationAttempt.scenario);
          for(const [key,,value] of s.fields)await page.locator('[name='+key+']').fill(wrong&&key==='network'?'1.2.3.4':value);
          for(const name of ['choice','secondChoice'])if(s[name])await page.locator('input[name='+name+'][value="'+s[name].a+'"]').check();
        };
        if(id==='subnets'){
          await page.locator('#foundationHint').click();await fill(true);await page.locator('#submitFoundationScenario').click();
          assert.match(await page.locator('#foundationFeedback').innerText(),/Review the reasoning/);
          assert(await page.evaluate(()=>state.foundations.attempts.at(-1).helpUsed));
          const before=await page.evaluate(()=>state.foundations.attempts.length);
          await page.locator('#foundationScenario').evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
          assert.equal(await page.evaluate(()=>state.foundations.attempts.length),before);
          await page.locator('#newFoundationScenario').click();
        }
        await fill(false);await page.locator('#submitFoundationScenario').click();
        assert.match(await page.locator('#foundationFeedback').innerText(),/All answers correct/);
        assert.equal(await page.evaluate(()=>state.foundations.attempts.at(-1).helpUsed),false);
        if(id==='subnets')await page.screenshot({path:path.join(artifacts,'subnet-feedback-'+width+'.png'),fullPage:true});
        await page.locator('#scenarioWorkshop').click();
      }
      assert.equal(await page.evaluate(()=>state.foundations.read.length),4);
      assert.equal(await page.evaluate(()=>state.foundations.attempts.length),5);
      const downloadPromise=page.waitForEvent('download');await page.locator('#exportFoundation').click();const download=await downloadPromise;
      assert.equal(download.suggestedFilename(),'networking-foundations-notes.md');
      await download.saveAs(path.join(artifacts,'notes-'+width+'.md'));
      assert.match(fs.readFileSync(path.join(artifacts,'notes-'+width+'.md'),'utf8'),/not a certification/);
      await page.reload();await page.locator('#continueBtn').waitFor();
      assert.equal(await page.evaluate(()=>state.foundations.read.length),4);assert.equal(await page.evaluate(()=>state.foundations.attempts.length),5);
      await page.locator('[data-view=foundations]').click();await page.locator('.workshop-unit[data-unit=journey]').click();
      assert.match(await page.locator('#foundationNote').inputValue(),/<example>/);assert.equal(await page.locator('example').count(),0);
      assert.deepEqual(errors,[]);await page.close();console.log('PASS browser flows and foundations workshop at '+width+'px');
    }
    const legacy=await browser.newPage();
    await legacy.addInitScript(()=>{if(!localStorage.ccnaLaunchpad)localStorage.ccnaLaunchpad=JSON.stringify({done:['f1','cli0'],labsDone:['l1'],quizTotal:99,quizCorrect:99});});
    await legacy.goto(url);await legacy.locator('#continueBtn').waitFor();
    assert.equal(await legacy.evaluate(()=>state.done.length),2);
    assert.equal(await legacy.evaluate(()=>state.labsDone.length),0);
    assert.match(await legacy.locator('#content').innerText(),/Earlier lab completions remain recorded/);
    await legacy.locator('#continueBtn').click();await legacy.locator('[data-id=f2]').click();await legacy.locator('#markDone').click();await legacy.reload();await legacy.locator('#continueBtn').waitFor();
    assert.equal(await legacy.evaluate(()=>state.done.length),3);
    assert.equal(await legacy.evaluate(()=>state.legacy.quizTotal),99);
    await legacy.close();
    const broken=await browser.newPage();await broken.addInitScript(()=>{localStorage.ccnaLaunchpad='{broken';});
    await broken.goto(url);await broken.locator('#continueBtn').waitFor();assert(await broken.locator('#storageNotice').isVisible());
    await broken.locator('#continueBtn').click();await broken.locator('[data-id=f1]').click();await broken.locator('#markDone').click();
    assert.equal(await broken.evaluate(()=>localStorage.ccnaLaunchpad),'{broken');await broken.close();
    const denied=await browser.newPage();
    await denied.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError');};});
    await denied.goto(url);await denied.locator('#continueBtn').click();await denied.locator('[data-id=f1]').click();await denied.locator('#markDone').click();
    await denied.locator('#storageNotice').waitFor();assert(await denied.evaluate(()=>state.done.includes('f1')));await denied.close();
    console.log('PASS migration, corrupted progress, and save-failure handling');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
