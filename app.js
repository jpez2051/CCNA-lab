const VERSION = '1.2.0';
let state, currentView = 'dashboard', currentLesson = null;
let quizQuestions = [], quizIndex = 0, quizAnswers = [];
let quizAnswered = false;
const content = document.querySelector('#content');
const pageTitle = document.querySelector('#pageTitle');
const storageNotice = document.querySelector('#storageNotice');
function showStorageError(error) {
  storageNotice.hidden = false;
  storageNotice.textContent = error.message || 'Progress could not be saved. Changes remain in this session.';
}
function save() {
  return ProgressStore.save(state).then(() => { storageNotice.hidden = true; return true; })
    .catch(error => { showStorageError(error); return false; });
}
function recordAnswer(q, correct, source) {
  const now = new Date().toISOString(), prior = state.questions[q.id];
  state.questions[q.id] = {
    firstCorrect: prior ? prior.firstCorrect : correct,
    lastCorrect: correct, attempts: (prior?.attempts || 0) + 1,
    practiceCount: (prior?.practiceCount || 0) + (source === 'practice' ? 1 : 0),
    firstAnsweredAt: prior?.firstAnsweredAt || now, lastAnsweredAt: now
  };
  save();
}
function activate(view) {
  currentView = view;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
}
function setView(view) { activate(view); currentLesson = null; render(); window.scrollTo(0,0); }
function openLesson(id) { activate('learn'); currentLesson = id; renderLesson(id); window.scrollTo(0,0); }
function launchLab(id) { activate('labs'); currentLesson = null; renderLabs(id); window.scrollTo(0,0); }
function render() {
  if (currentView === 'dashboard') renderDashboard();
  if (currentView === 'learn') currentLesson ? renderLesson(currentLesson) : renderLearn();
  if (currentView === 'labs') renderLabs();
  if (currentView === 'practice') renderPractice();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'foundations') renderFoundations();
}
function readCount(list = lessons) { return list.filter(l => state.done.includes(l.id)).length; }
function nextCourseStep() {
  for (const lesson of lessons) {
    if (!state.done.includes(lesson.id)) return {lesson};
    if (lesson.lab && !state.labsDone.includes(lesson.lab) && state.done.includes(labs[lesson.lab].prereq)) return {lesson, labId:lesson.lab};
  }
  return null;
}
function nextStepHtml(step, message) {
  return '<section class="card next-step" aria-labelledby="nextStepTitle"><p role="status">' + message +
    '</p><h2 id="nextStepTitle" tabindex="-1">' + (step ? step.labId ? labs[step.labId].title : step.lesson.title : 'All current readings and guided exercises recorded') +
    '</h2>' + (step ? '<button class="btn btn-primary" id="nextCourseStep">' + (step.labId ? 'Launch required lab' : 'Open next recommended lesson') + '</button>' :
      '<p>Review a topic or practice again. Completion does not establish independent skill or exam readiness.</p>') + '</section>';
}
function wireNextStep(step) {
  if (step) document.querySelector('#nextCourseStep').onclick = () => step.labId ? launchLab(step.labId) : openLesson(step.lesson.id);
}
function reviewButtons(questions) {
  return questions.map(q => '<button class="btn btn-secondary review-lesson" data-lesson="' + q.lessonId + '">' + q.lesson + '</button>').join('');
}
function wireReview() { document.querySelectorAll('.review-lesson').forEach(b => b.onclick = () => openLesson(b.dataset.lesson)); }
function renderDashboard() {
  pageTitle.textContent = 'Your networking study space';
  const answered = quizBank.filter(q => state.questions[q.id]);
  const firstCorrect = answered.filter(q => state.questions[q.id].firstCorrect).length;
  const revisit = answered.filter(q => !state.questions[q.id].lastCorrect);
  const step = nextCourseStep();
  const historical = state.legacyLabsDone.filter(id => labs[id] && !state.labsDone.includes(id));
  content.innerHTML = '<section class="hero"><span class="pill">LEARN AT YOUR PACE</span><h2>Understand it. Practice it. Explain it.</h2>' +
    '<p>Build on the networking language you already know. These introductory summaries and guided command exercises are a starting point, not a complete CCNA course or an exam-readiness assessment.</p>' +
    '<div class="cta-row"><button class="btn btn-primary" id="foundationStart">Start foundations workshop</button><button class="btn btn-secondary" id="continueBtn">Browse lesson summaries</button><button class="btn btn-secondary" id="labBtn">Open CLI practice</button></div><p>New: four connected foundations units with worked examples, guided practice, fresh scenarios, and reflection notes.</p></section>' +
    '<div class="section-head"><div><h3>Your recorded work</h3><p>Reading, answering, and guided practice are different kinds of progress.</p></div></div>' +
    '<div class="grid grid-3"><div class="card metric"><b>' + readCount() + ' / ' + lessons.length + '</b><small>lessons marked read · self-reported</small></div>' +
    '<div class="card metric"><b>' + (answered.length ? firstCorrect + ' / ' + answered.length : 'No answers yet') + '</b><small>distinct questions correct on your first answer</small><p class="q-meta">Retries and practice reuse do not change this first-answer record.</p></div>' +
    '<div class="card metric"><b>' + state.labsDone.length + ' / ' + Object.keys(labs).length + '</b><small>guided command exercises verified</small><p class="q-meta">This records supported configuration and inspection tasks, not working network connectivity.</p></div></div>' +
    (state.legacy ? '<p class="q-meta">Your earlier reading progress is preserved. Old aggregate quiz scores are archived because they counted repeat clicks.' + (historical.length ? ' Earlier lab completions remain recorded; repeat those exercises once with the corrected checker.' : '') + '</p>' : '') +
    '<div class="section-head"><h3>What to revisit</h3></div><div class="card">' +
    (revisit.length ? '<p>Your latest answer was incorrect on these topics. Revisit the explanation, then try again.</p><div class="review-list">' + reviewButtons(revisit) + '</div>' :
      '<p>' + (answered.length ? 'No incorrect latest answers to revisit. Try a different question or explain a concept without looking.' : 'Answer a knowledge check to identify a topic to revisit.') + '</p>') +
    '<button class="btn btn-secondary" id="practiceBtn">Practice questions</button></div><div class="section-head"><h3>Next step</h3></div>' + nextStepHtml(step,'Continue from your recorded progress') +
    '<div class="section-head"><h3>Browse topics</h3><button class="btn btn-secondary" id="allLessons">View course</button></div><div class="grid grid-3">' +
    domains.map(d => '<button class="card domain-card" data-domain="' + d.id + '"><span class="domain-icon">' + d.icon + '</span><h4>' + d.title + '</h4><p>' + d.desc + '</p><div class="domain-meta">' + readCount(lessons.filter(l => l.domain === d.id)) + ' of ' + lessons.filter(l => l.domain === d.id).length + ' marked read</div></button>').join('') + '</div>' +
    '<div class="section-head"><h3>Progress storage</h3></div><div class="card"><p>Your progress is currently stored in this browser. Clearing browser data removes it.</p><button class="btn btn-secondary" id="resetProgressMain">Reset progress</button></div>';
  document.querySelector('#resetProgressMain').onclick = resetProgress;
  document.querySelector('#continueBtn').onclick = () => setView('learn');
  document.querySelector('#foundationStart').onclick = () => setView('foundations');
  document.querySelector('#allLessons').onclick = () => setView('learn');
  document.querySelector('#labBtn').onclick = () => setView('labs');
  document.querySelector('#practiceBtn').onclick = () => setView('practice');
  document.querySelectorAll('.domain-card').forEach(b => b.onclick = () => { activate('learn'); currentLesson = null; renderLearn(b.dataset.domain); });
  wireReview(); wireNextStep(step);
}
function renderLearn(filter = null, completedId = null) {
  activate('learn'); currentLesson = null; pageTitle.textContent = 'Guided networking course';
  const completed = lessons.find(l => l.id === completedId);
  const pendingLab = completed?.lab && !state.labsDone.includes(completed.lab) ? completed.lab : null;
  const step = pendingLab ? {lesson:completed,labId:pendingLab} : nextCourseStep();
  content.innerHTML = nextStepHtml(step,completed ? 'Lesson marked read. Choose your next step.' : 'Your next recommended step') +
    '<p class="course-note">Marking a lesson read records that you reviewed it; it does not certify mastery. Knowledge checks and guided exercises are recorded separately. You can always reopen a lesson.</p>' +
    (filter ? '<button class="btn btn-secondary" id="showAll">Show all topics</button>' : '') +
    (filter ? domains.filter(d => d.id === filter) : domains).map(d => '<div class="section-head"><div><h3>' + d.icon + ' ' + d.title + '</h3><p>' + d.desc +
      '</p></div><span class="pill">' + readCount(lessons.filter(l => l.domain === d.id)) + ' / ' + lessons.filter(l => l.domain === d.id).length + ' read</span></div><div class="module-list">' +
      lessons.filter(l => l.domain === d.id).map((l,i) => '<button type="button" class="module ' + (step?.lesson.id === l.id ? 'recommended' : '') + '" data-id="' + l.id +
        '"><span class="module-num">' + (i+1) + '</span><span><strong>' + l.title + '</strong><span class="module-detail">' +
        (state.done.includes(l.id) ? '✓ Read · Reopen for review' : 'Introductory lesson') +
        (l.lab ? state.labsDone.includes(l.lab) ? ' · Guided exercise verified' : state.legacyLabsDone.includes(l.lab) ? ' · Earlier lab recorded; verification pending' : ' · Associated lab pending' : '') +
        '</span></span><span class="badge ' + (l.lab ? 'lab' : '') + '">' + (step?.lesson.id === l.id ? 'NEXT' : l.lab ? 'LAB' : 'LESSON') + '</span></button>').join('') + '</div>').join('');
  document.querySelectorAll('.module').forEach(b => b.onclick = () => openLesson(b.dataset.id));
  if (filter) document.querySelector('#showAll').onclick = () => renderLearn();
  wireNextStep(step);
  if (completedId) { window.scrollTo(0,0); document.querySelector('#nextStepTitle').focus({preventScroll:true}); }
}
function renderLesson(id) {
  const l = lessons.find(x => x.id === id), d = domains.find(x => x.id === l.domain);
  const q = quizBank.find(x => x.lessonId === id);
  pageTitle.textContent = l.title;
  content.innerHTML = '<div class="lesson-layout"><article class="card lesson-card"><span class="pill">' + d.title.toUpperCase() +
    '</span><h2>' + l.title + '</h2><p class="q-meta">Introductory explanation · work at your own pace</p>' + l.body +
    '<h3>Check your understanding</h3><div class="check" id="lessonCheck"><fieldset><legend>' + q.q + '</legend>' +
    q.opts.map((o,i) => '<label><input type="radio" name="q" value="' + i + '"> ' + o + '</label>').join('') +
    '</fieldset><p class="q-meta">' + (state.questions[q.id] ? 'You have answered this question before. This is review; your first-answer record stays unchanged.' : 'Your first answer to this question is recorded separately from later attempts.') +
    '</p><button class="btn btn-secondary" id="checkAnswer">Check answer</button><button class="btn btn-secondary" id="retryAnswer" hidden>Try again for review</button><div class="result" id="result" role="status"></div></div></article>' +
    '<aside class="card lesson-nav"><h4>Lesson progress</h4><p class="q-meta">Mark this read when you have reviewed the explanation. Reading is a starting point; practicing without help comes later.</p>' +
    (l.lab ? '<button class="btn btn-secondary" id="openLessonLab">Run associated lab</button>' : '') +
    '<button class="btn btn-primary" id="markDone">' + (state.done.includes(id) ? '✓ Read — return to course' : 'Mark lesson read') +
    '</button><button class="btn btn-secondary" id="backCourse">Back to course</button></aside></div>';
  const check = document.querySelector('#checkAnswer'), retry = document.querySelector('#retryAnswer');
  check.onclick = () => {
    if (check.disabled) return;
    const input = document.querySelector('input[name=q]:checked');
    if (!input) { document.querySelector('#result').textContent = 'Choose an answer first.'; return; }
    const correct = Number(input.value) === q.a;
    check.disabled = true;
    document.querySelectorAll('input[name=q]').forEach(r => r.disabled = true);
    recordAnswer(q,correct,'lesson');
    document.querySelector('#result').innerHTML = '<span class="' + (correct ? 'ok' : 'bad') + '">' + (correct ? 'Correct. ' : 'Not yet. ') + '</span>' + q.e;
    retry.hidden = false;
  };
  retry.onclick = () => {
    check.disabled = false; retry.hidden = true;
    document.querySelectorAll('input[name=q]').forEach(r => { r.disabled = false; r.checked = false; });
    document.querySelector('#result').textContent = 'Review attempt — the first-answer record will not change.';
    document.querySelector('input[name=q]').focus({preventScroll:true});
  };
  function updateLabStatus() {
    const button = document.querySelector('#openLessonLab');
    const read = state.done.includes(labs[l.lab].prereq);
    button.disabled = !read;
    button.textContent = read ? 'Run associated lab' : 'Mark the prerequisite lesson read to unlock';
    if (!state.done.includes(id)) return;
    document.querySelector('#markDone').textContent = '✓ Lesson marked read';
    let status = document.querySelector('#lessonStatus');
    if (!status) { status = document.createElement('p'); status.id = 'lessonStatus'; status.className = 'q-meta'; status.setAttribute('role','status'); document.querySelector('#markDone').before(status); }
    status.textContent = state.labsDone.includes(l.lab) ? 'Reading and guided exercise recorded. You can review either again.' : 'Lesson marked read — now apply it in the lab.';
  }
  if (l.lab) { updateLabStatus(); document.querySelector('#openLessonLab').onclick = () => launchLab(l.lab); }
  document.querySelector('#markDone').onclick = () => {
    if (!state.done.includes(id)) state.done.push(id);
    save();
    if (l.lab) updateLabStatus(); else renderLearn(null,id);
  };
  document.querySelector('#backCourse').onclick = () => renderLearn();
}
function renderLabs(selected = 'l1') {
  if (!labs[selected]) selected = 'l1';
  const lab = labs[selected], prerequisite = lessons.find(l => l.id === lab.prereq);
  pageTitle.textContent = 'Guided CLI practice';
  const selector = '<select id="labSelect" aria-label="Choose a guided exercise" class="btn btn-secondary">' +
    Object.entries(labs).map(([id,l]) => '<option value="' + id + '" ' + (id === selected ? 'selected' : '') + '>' + (!state.done.includes(l.prereq) ? '🔒 ' : '') + l.title + '</option>').join('') + '</select>';
  content.innerHTML = '<div class="section-head"><div><h3>' + lab.title + '</h3><p>Practice a small set of configuration and inspection commands.</p></div>' + selector + '</div>';
  if (!state.done.includes(lab.prereq)) {
    content.innerHTML += '<div class="card"><h2>Start with the prerequisite reading</h2><p>Review <b>' + prerequisite.title +
      '</b>, then mark it read to unlock this guided exercise. This unlock records reading, not mastery.</p><div class="cta-row"><button class="btn btn-primary" id="goPrereq">Go to prerequisite lesson</button><button class="btn btn-secondary" id="backCourseFromLab">Back to course</button></div></div>';
    document.querySelector('#goPrereq').onclick = () => openLesson(lab.prereq);
    document.querySelector('#backCourseFromLab').onclick = () => setView('learn');
  } else {
    content.innerHTML += '<p class="course-note">This is guided command practice, not a network emulator. It has no real links, traffic, OSPF neighbors, or interface ACL enforcement. An unfinished attempt resets when you leave or reload; completed exercise records are retained.</p>' +
      '<div class="terminal-wrap"><div class="terminal"><div class="terminal-head">Limited Cisco-style command practice</div><div class="term-output" id="termOut" tabindex="0" aria-label="Command output"></div>' +
      '<div class="term-input-row"><span class="prompt" id="prompt"></span><input class="term-input" id="termInput" aria-label="Cisco practice command" autocomplete="off" spellcheck="false"></div></div>' +
      '<div class="card"><h4>Current attempt</h4><div class="task-list">' +
      lab.goals.map((goal,i) => '<div class="task" data-task="' + i + '"><b>' + (i+1) + '. ' + goal + '</b><details><summary>Show command hint</summary><p class="hint">' + lab.hints[i] + '</p></details></div>').join('') +
      '</div><div id="labDone" role="status"></div><div class="cta-row"><button class="btn btn-secondary" id="resetLab">Restart this attempt</button><button class="btn btn-secondary" id="labCourse">Back to course</button></div></div></div>';
    document.querySelector('#resetLab').onclick = () => { if (confirm('Restart this attempt? Its working configuration will be cleared. Earlier completed exercise records are kept.')) renderLabs(selected); };
    document.querySelector('#labCourse').onclick = () => setView('learn');
    initTerminal(selected);
  }
  document.querySelector('#labSelect').onchange = e => renderLabs(e.target.value);
}
function initTerminal(id) {
  const session = new LabSession(id);
  const out = document.querySelector('#termOut'), input = document.querySelector('#termInput'), status = document.querySelector('#labDone');
  out.textContent = 'Type ? for supported commands. Inspect the final configuration after making changes.\n';
  let wasComplete = null;
  function sync() {
    document.querySelector('#prompt').textContent = session.prompt;
    document.querySelectorAll('.task').forEach((t,i) => t.classList.toggle('done',session.checklist[i]));
    if (session.complete === wasComplete) return;
    wasComplete = session.complete;
    if (session.complete) {
      state.labEvidence[id] = {validationVersion:LAB_VALIDATION_VERSION,completedAt:new Date().toISOString(),guided:true};
      if (!state.labsDone.includes(id)) state.labsDone.push(id);
      save();
      status.innerHTML = '<div class="lab-success"><b>Guided exercise verified.</b> The supported target configuration is present and you inspected it after the latest change. This does not prove network connectivity or independent skill.<br><button class="btn btn-primary" id="labBackCourse">Back to course — next step</button></div>';
      document.querySelector('#labBackCourse').onclick = () => setView('learn');
    } else {
      status.innerHTML = '<p class="q-meta">' + (state.labsDone.includes(id) ? 'An earlier verified attempt is recorded. This current attempt is not yet verified.' : state.legacyLabsDone.includes(id) ? 'An earlier version recorded completion. Verify this attempt with the corrected checker.' : 'Configure the target, then inspect it. Any configuration change requires verification again.') + '</p>';
    }
  }
  input.onkeydown = e => {
    if (e.key !== 'Enter') return;
    const command = input.value;
    out.textContent += session.prompt + command + '\n';
    const result = session.run(command);
    if (result) out.textContent += result + '\n';
    input.value = ''; out.scrollTop = out.scrollHeight; sync();
  };
  sync();
}
function shuffled(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function renderPractice() {
  pageTitle.textContent = 'Knowledge-check practice';
  // Least-practiced questions first; shuffle ties. Count only answered questions, not abandoned sessions.
  quizQuestions = shuffled(quizBank).sort((a,b) => (state.questions[a.id]?.practiceCount || 0) - (state.questions[b.id]?.practiceCount || 0)).slice(0,10);
  quizIndex = 0; quizAnswers = []; showQuiz();
}
function showQuiz() {
  quizAnswered = false;
  const q = quizQuestions[quizIndex], review = !!state.questions[q.id];
  content.innerHTML = '<div class="card quiz-card"><p class="q-meta">Question ' + (quizIndex+1) + ' of ' + quizQuestions.length + ' · ' + domains.find(d => d.id === q.domain).title +
    ' · ' + (review ? 'Previously answered — review' : 'Not previously answered') + '</p><h2>' + q.q +
    '</h2><div class="quiz-options">' + q.opts.map((option,i) => '<button class="quiz-option" data-i="' + i + '">' + option + '</button>').join('') +
    '</div><div id="quizExplain" role="status"></div><p class="q-meta">Questions rotate across the available bank. These short checks do not assess exam readiness.</p></div>';
  document.querySelectorAll('.quiz-option').forEach(b => b.onclick = () => answerQuiz(b,q));
}
function answerQuiz(button,q) {
  if (quizAnswered) return;
  quizAnswered = true;
  const selected = Number(button.dataset.i), correct = selected === q.a;
  quizAnswers.push({q,correct}); recordAnswer(q,correct,'practice');
  document.querySelectorAll('.quiz-option').forEach((b,i) => { b.disabled = true; if (i === q.a) b.classList.add('correct'); else if (i === selected) b.classList.add('wrong'); });
  document.querySelector('#quizExplain').innerHTML = '<div class="explain"><b>' + (correct ? 'Correct. ' : 'Review this concept. ') + '</b>' + q.e +
    '<p>Source lesson: ' + q.lesson + '</p><button class="btn btn-primary" id="nextQuiz">' + (quizIndex === quizQuestions.length-1 ? 'Review session' : 'Next question') + '</button></div>';
  document.querySelector('#nextQuiz').onclick = () => { quizIndex++; if (quizIndex >= quizQuestions.length) showQuizResult(); else showQuiz(); };
}
function showQuizResult() {
  const missed = quizAnswers.filter(a => !a.correct).map(a => a.q);
  content.innerHTML = '<div class="card quiz-card"><h2>Review this practice session</h2><p>' + (quizAnswers.length-missed.length) + ' of ' + quizAnswers.length +
    ' answers correct in this session. Some questions may be repeats; this is not a mastery score.</p>' +
    (missed.length ? '<h3>Revisit these explanations</h3><div class="review-list">' + reviewButtons(missed) + '</div>' : '<p>Try explaining a concept without looking, or apply it in guided practice.</p>') +
    '<button class="btn btn-primary" id="again">Practice another set</button></div>';
  document.querySelector('#again').onclick = renderPractice; wireReview();
}
function renderRoadmap() {
  pageTitle.textContent = 'Build toward independent skills';
  const stages = [
    ['Understand the foundations','Explain how a client reaches an application. Interpret an IP address, subnet mask, gateway, and DNS settings.','Available: the four-unit foundations workshop includes worked examples, guided practice, subnet calculations, and limited first-submission scenarios. Broader curriculum coverage is still needed.'],
    ['Practice configuration','Read CLI prompts, enter a configuration, inspect the output, and explain what each command changes.','Current app: five limited, guided command exercises. Use a network simulator for connectivity practice.'],
    ['Diagnose unfamiliar problems','Gather evidence, test a hypothesis, correct a fault, and verify the result.','Planned: structured troubleshooting assignments and topology exercises.'],
    ['Retain and demonstrate','Return to a skill later and solve a different problem without instructions. Document the reasoning for your portfolio.','Planned: delayed review, independent challenges, and portfolio evidence.'],
    ['Prepare against an exam blueprint','Map each objective to instruction and practical evidence, then use independent assessment.','This app does not yet provide comprehensive CCNA coverage or a readiness assessment.']
  ];
  content.innerHTML = '<div class="hero"><span class="pill">SKILLS, NOT A COUNTDOWN</span><h2>Move forward when the work makes sense.</h2><p>This is a development path, not a promised completion schedule. Reading progress, guided practice, and independent ability should remain separate.</p></div><div class="roadmap">' +
    stages.map((s,i) => '<div class="road-step"><div class="road-dot">' + (i+1) + '</div><div class="road-body"><h3>' + s[0] + '</h3><p>' + s[1] + '</p><p class="availability">' + s[2] + '</p></div></div>').join('') + '</div>';
}
async function resetProgress() {
  if (!confirm('Reset all reading, question, and guided exercise records? This cannot be undone.')) return;
  try { await ProgressStore.clear(); state = ProgressStore.normalize(null); storageNotice.hidden = true; setView('dashboard'); }
  catch(error) { showStorageError(error); }
}
async function start() {
  try { state = await ProgressStore.load(); }
  catch(error) { state = ProgressStore.normalize(null); showStorageError(error); }
  document.title = 'CCNA Launchpad v' + VERSION;
  document.querySelector('.brand span').textContent = 'v' + VERSION;
  document.querySelector('#nav').onclick = e => { const b=e.target.closest('.nav-btn'); if (b) setView(b.dataset.view); };
  document.querySelectorAll('.nav-btn').forEach(b => b.setAttribute('aria-label',b.textContent.trim()));
  document.querySelector('#resetProgress').onclick = resetProgress;
  render();
}
start();
