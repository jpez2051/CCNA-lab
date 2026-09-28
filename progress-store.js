// v1.1.4: persistence boundary. Learning code uses the same async contract for any adapter.
const ProgressStore = (() => {
  const key = 'ccnaLaunchpad';
  const strings = value => Array.isArray(value) ? [...new Set(value.filter(x => typeof x === 'string'))] : [];
  function normalize(raw) {
    const old = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const current = old.schemaVersion === 2;
    const progress = {
      schemaVersion: 2,
      done: strings(old.done).filter(id => lessons.some(l => l.id === id)),
      labsDone: [],
      labEvidence: {},
      questions: {},
      foundations: normalizeFoundations(old.foundations),
      legacyLabsDone: strings(current ? old.legacyLabsDone : old.labsDone),
      legacy: current ? old.legacy || null : Object.keys(old).length ? old : null
    };
    if (current) {
      for (const id of Object.keys(labs)) {
        const evidence = old.labEvidence?.[id];
        if (evidence?.validationVersion === LAB_VALIDATION_VERSION && typeof evidence.completedAt === 'string') {
          progress.labEvidence[id] = evidence;
          progress.labsDone.push(id);
        }
      }
      for (const q of quizBank) {
        const answer = old.questions?.[q.id];
        if (answer && typeof answer.firstCorrect === 'boolean' && typeof answer.lastCorrect === 'boolean') {
          progress.questions[q.id] = {
            firstCorrect: answer.firstCorrect, lastCorrect: answer.lastCorrect,
            attempts: Number.isSafeInteger(answer.attempts) && answer.attempts > 0 ? answer.attempts : 1,
            practiceCount: Number.isSafeInteger(answer.practiceCount) && answer.practiceCount >= 0 ? answer.practiceCount : 0,
            firstAnsweredAt: typeof answer.firstAnsweredAt === 'string' ? answer.firstAnsweredAt : null,
            lastAnsweredAt: typeof answer.lastAnsweredAt === 'string' ? answer.lastAnsweredAt : null
          };
        }
      }
    }
    return progress;
  }
  let unreadable = false;
  const localAdapter = {
    async load() {
      let stored;
      try { stored = localStorage.getItem(key); }
      catch { throw new Error('Saved progress is unavailable in this browser. You can continue for this session.'); }
      try { return stored ? JSON.parse(stored) : null; }
      catch { unreadable = true; throw new Error('Saved progress could not be read. It has not been overwritten. You can continue for this session or use Reset progress to start over.'); }
    },
    async save(value) {
      if (unreadable) throw new Error('The unreadable saved progress has not been overwritten. Changes remain in this session.');
      try { localStorage.setItem(key, JSON.stringify(value)); }
      catch { throw new Error('Progress could not be saved in this browser. Your changes remain available for this session.'); }
    },
    async clear() { localStorage.removeItem(key); unreadable = false; }
  };
  let adapter = localAdapter, pending = Promise.resolve();
  return {
    // Install a cloud adapter before app startup; it must enforce authenticated ownership.
    use(next) {
      if (!next || !['load', 'save', 'clear'].every(method => typeof next[method] === 'function')) throw new Error('Invalid progress adapter');
      adapter = next;
    },
    normalize,
    async load() { return normalize(await adapter.load()); },
    save(value) {
      const snapshot = JSON.parse(JSON.stringify(value));
      const operation = pending.catch(() => {}).then(() => adapter.save(snapshot));
      pending = operation;
      return operation;
    },
    clear() {
      const operation = pending.catch(() => {}).then(() => adapter.clear());
      pending = operation;
      return operation;
    }
  };
})();
