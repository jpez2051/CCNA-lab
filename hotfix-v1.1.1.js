// CCNA Launchpad v1.1.3 — beginner sequencing and lab prerequisite hotfix
(() => {
  const HOTFIX_VERSION = '1.1.3';

  // The original v1.0.0 sequence exposed Lab 1 before IOS modes were taught.
  // Insert a zero-assumption CLI lesson immediately after the first two foundations lessons.
  if (!lessons.some(l => l.id === 'cli0')) {
    const cliLesson = {
      id: 'cli0',
      domain: 'fund',
      title: 'Before Your First Lab: Cisco CLI Basics',
      mins: 20,
      lab: 'l1',
      body: `
        <p><b>This lesson assumes you have never touched a Cisco command line.</b> Before configuring anything, you need to understand what the prompt is telling you and why a command works in one place but not another.</p>

        <h3>What is the CLI?</h3>
        <p><b>CLI</b> means <b>Command-Line Interface</b>. Instead of clicking buttons, you type commands into a Cisco switch or router. Cisco IOS organizes those commands into <b>modes</b>. A mode is simply a level of access with a particular job.</p>
        <div class="analogy"><b>Think of modes like rooms in a building.</b> The lobby lets you look around. The staff room gives you more tools. The workshop is where you are allowed to change things. The symbol at the end of the prompt tells you which room you are in.</div>

        <h3>The three modes you need for Lab 1</h3>
        <div class="concept-box">
          <p><code>Switch&gt;</code> — <b>User EXEC mode.</b> This is the starting point. Access is limited. The <code>&gt;</code> is your clue.</p>
          <p><code>Switch#</code> — <b>Privileged EXEC mode.</b> You can run powerful verification and administration commands. The <code>#</code> is your clue.</p>
          <p><code>Switch(config)#</code> — <b>Global configuration mode.</b> This is where you change the device's running configuration. The <code>(config)#</code> is your clue.</p>
        </div>
        <p><b>EXEC</b> is Cisco's name for command modes used to operate and inspect the device. You do not need to memorize that definition perfectly yet; you do need to recognize the prompts.</p>

        <h3>Walk through the exact sequence</h3>
        <p>When the lab opens, imagine the switch has just presented this prompt:</p>
        <p><code>Switch&gt;</code></p>
        <p>1. Type <code>enable</code>. This moves you from user EXEC to privileged EXEC:</p>
        <p><code>Switch&gt; enable</code><br><code>Switch#</code></p>
        <p>2. Type <code>configure terminal</code>. This means “I want to change the active configuration”:</p>
        <p><code>Switch# configure terminal</code><br><code>Switch(config)#</code></p>
        <p>3. Type <code>hostname SW1</code>. A hostname is the device's human-friendly name. Notice that the prompt changes because the device is now named SW1:</p>
        <p><code>Switch(config)# hostname SW1</code><br><code>SW1(config)#</code></p>
        <p>4. Type <code>end</code>. This leaves configuration mode and returns directly to privileged EXEC:</p>
        <p><code>SW1(config)# end</code><br><code>SW1#</code></p>
        <p>5. Type <code>show running-config</code>. <b>Show</b> commands inspect the device. The <b>running configuration</b> is the configuration currently active in memory.</p>

        <div class="warning"><b>Do not memorize five mystery commands.</b> Read the prompt after every command. Ask yourself: “What mode am I in now, and am I inspecting the device or changing it?” That habit is far more useful than blindly copying syntax.</div>

        <h3>One important distinction for later</h3>
        <p><code>show running-config</code> displays the configuration currently being used. Cisco devices also have a <b>startup configuration</b>, which is the saved configuration used after a reboot. We will teach saving configurations separately; Lab 1 only asks you to inspect what is running now.</p>

        <h3>What success looks like</h3>
        <p>Before opening Lab 1, you should be able to look at <code>&gt;</code>, <code>#</code>, and <code>(config)#</code> and say what each means. You do <b>not</b> need to know every Cisco command.</p>
      `,
      q: {
        q: 'You see the prompt Switch(config)#. What does that tell you?',
        opts: [
          'You are in user EXEC mode',
          'You are in privileged EXEC mode',
          'You are in global configuration mode and can change the device configuration',
          'The switch has lost its configuration'
        ],
        a: 2,
        e: 'The (config)# prompt means global configuration mode. This is where device-wide configuration changes are made.'
      }
    };

    const insertAfter = lessons.findIndex(l => l.id === 'f2');
    lessons.splice(insertAfter + 1, 0, cliLesson);
    quizBank.push({ ...cliLesson.q, lesson: cliLesson.title, domain: cliLesson.domain });
  }

  // Ethernet theory should not launch an IOS configuration lab before CLI training.
  const ethernetLesson = lessons.find(l => l.id === 'f3');
  if (ethernetLesson) ethernetLesson.lab = null;

  // Avoid presenting the same first lab twice later in the switching section.
  const oldIosLesson = lessons.find(l => l.id === 'a1');
  if (oldIosLesson) {
    oldIosLesson.lab = null;
    oldIosLesson.title = 'Cisco IOS: Reinforce the CLI Fundamentals';
    oldIosLesson.body = `<p>Earlier, you learned the three Cisco IOS modes used in your first lab. Now reinforce the model before moving into VLAN configuration.</p>
      <h3>Read the prompt before the command</h3>
      <p><code>&gt;</code> means user EXEC, <code>#</code> means privileged EXEC, and <code>(config)#</code> means global configuration mode. Commands are mode-sensitive: a valid command entered in the wrong mode can still fail.</p>
      <h3>Navigation you should now recognize</h3>
      <p><code>enable</code> → privileged EXEC. <code>configure terminal</code> → global configuration. <code>end</code> → privileged EXEC. <code>exit</code> normally moves back one level.</p>
      <div class="concept-box"><b>Troubleshooting habit:</b> when IOS rejects a command, check the current prompt before assuming the command itself is wrong.</div>`;
  }

  // Make the first lab visibly demonstrate the hostname change.
  labs.l1.device = 'Switch';
  labs.l1.title = 'Lab 1 — Your First Guided Cisco CLI Session';

  // Each lab now declares the lesson that must be learned first.
  const prerequisites = {
    l1: 'cli0',
    l2: 'a2',
    l3: 'r2',
    l4: 'r3',
    l5: 'sec2'
  };
  Object.entries(prerequisites).forEach(([labId, lessonId]) => {
    labs[labId].prereq = lessonId;
  });

  // The routing overview comes before the static-route configuration prerequisite.
  lessons.find(l => l.id === 'r1').lab = null;
  const baseRenderLesson = renderLesson;
  renderLesson = function(id) {
    baseRenderLesson(id);
    const lesson = lessons.find(l => l.id === id);
    const button = document.querySelector('#openLessonLab');
    if (button && labs[lesson.lab].prereq && !state.done.includes(labs[lesson.lab].prereq)) {
      button.textContent = 'Master the prerequisite lesson to unlock this lab';
      button.disabled = true;
    }
  };

  // Gate the Labs tab itself. A learner can explore the tab, but cannot enter an
  // exercise whose vocabulary and commands have not yet been taught.
  const baseRenderLabs = renderLabs;
  renderLabs = function(selected = 'l1') {
    const lab = labs[selected] || labs.l1;
    const prerequisiteId = lab.prereq;
    const prerequisite = lessons.find(l => l.id === prerequisiteId);
    const unlocked = !prerequisiteId || state.done.includes(prerequisiteId);

    if (unlocked) {
      baseRenderLabs(selected);
      return;
    }

    pageTitle.textContent = 'Lab prerequisites';
    content.innerHTML = `
      <div class="section-head">
        <div>
          <h3>${lab.title}</h3>
          <p>Labs unlock after the app teaches the concepts and commands they require.</p>
        </div>
        <select id="labSelect" class="btn btn-secondary">
          ${Object.entries(labs).map(([k, v]) => {
            const req = v.prereq;
            const isOpen = !req || state.done.includes(req);
            return `<option value="${k}" ${k === selected ? 'selected' : ''}>${isOpen ? '✓' : '🔒'} ${v.title}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="card" style="max-width:760px;margin:0 auto;padding:28px">
        <span class="pill">🔒 NOT YET — AND THAT'S INTENTIONAL</span>
        <h2 style="margin-bottom:8px">Learn it before you configure it.</h2>
        <p style="color:var(--muted)">This lab uses knowledge from <b style="color:var(--text)">${prerequisite ? prerequisite.title : 'an earlier lesson'}</b>. Complete that lesson, then return here to practice.</p>
        ${selected === 'l1' ? `<div class="concept-box" style="margin:18px 0"><b>Before Lab 1 you will learn:</b><br>• what the Cisco CLI is<br>• what user EXEC, privileged EXEC, and global configuration modes mean<br>• how the prompt changes between <code>&gt;</code>, <code>#</code>, and <code>(config)#</code><br>• why <code>enable</code>, <code>configure terminal</code>, <code>end</code>, and <code>show running-config</code> are used</div>` : ''}
        <button class="btn btn-primary" id="goPrereq">Go to prerequisite lesson</button>
        <button class="btn btn-secondary" id="backCourseFromLab" style="margin-left:8px">Back to course</button>
      </div>`;

    document.querySelector('#labSelect').onchange = e => renderLabs(e.target.value);
    document.querySelector('#goPrereq').onclick = () => {
      currentView = 'learn';
      currentLesson = prerequisiteId;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'learn'));
      render();
    };
    document.querySelector('#backCourseFromLab').onclick = () => setView('learn');
  };

  // Update visible version labels added by the original shell.
  document.title = `CCNA Launchpad v${HOTFIX_VERSION}`;
  const versionLabel = document.querySelector('.brand span');
  if (versionLabel) versionLabel.textContent = `v${HOTFIX_VERSION}`;

  // Re-render so the inserted lesson and prerequisite behavior take effect immediately.
  render();
})();
