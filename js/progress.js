const STORAGE_KEY = 'f2l-learned';

export function getLearnedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function setLearned(id, learned) {
  const set = getLearnedSet();
  learned ? set.add(id) : set.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  return set;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function renderProgressBar(total) {
  const wrap = document.querySelector('.progress-bar-wrap');
  if (!wrap) return;
  const count = getLearnedSet().size;
  const pct = total > 0 ? (count / total) * 100 : 0;
  wrap.querySelector('.progress-bar-fill').style.width = pct + '%';
  const lbl = wrap.querySelector('.progress-label');
  lbl.innerHTML = `<strong>${count}</strong> / ${total} learned`;
}
