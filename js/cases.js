import { getLearnedSet, setLearned, renderProgressBar, resetProgress } from './progress.js';
import { observeViewers, wireViewerControls } from './viewer.js';

const CATEGORIES = [
  { id: 'all',            label: 'All' },
  { id: 'easy',           label: 'Easy' },
  { id: 'both-in-top',    label: 'Both in Top' },
  { id: 'corner-in-slot', label: 'Corner in Slot' },
  { id: 'corner-in-top',  label: 'Corner in Top' },
  { id: 'advanced',       label: 'Advanced' },
  { id: 'learned',        label: 'Learned' },
];

const SUBGROUPS = {
  'white-side':  'White facing right or front',
  'white-up':    'White facing up',
  'awkward':     'Awkward diagonals',
};

const CATEGORY_ORDER = { easy: 0, 'both-in-top': 1, 'corner-in-slot': 2, 'corner-in-top': 3, advanced: 4 };
const SUBGROUP_ORDER = { 'white-side': 0, 'white-up': 1, 'awkward': 2 };

// JS owns chip colors — CSS face-color rules were removed (they were dead)
// F and L use dark text: white on green = 3.39:1 (fails AA), white on orange = 3.05:1 (fails AA)
const FACE_BG   = { U: '#FFD500', R: '#E03030', F: '#30A030', D: '#e8e8e8', L: '#E07820', B: '#3060E0' };
const FACE_TEXT = { U: '#000', R: '#fff', F: '#1a1a00', D: '#000', L: '#1a1a00', B: '#fff' };

let allCases = [];
let activeFilter = 'all';

// Learning/Reference mode — persisted in sessionStorage
let isLearningMode = sessionStorage.getItem('f2l-mode') !== 'reference';

async function init() {
  try {
    const res = await fetch('data/f2l-cases.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { cases } = await res.json();
    allCases = cases;
  } catch (err) {
    const grid = document.querySelector('.cases-grid');
    if (grid) {
      grid.innerHTML = `<p style="color:var(--text-muted);padding:var(--space-8);grid-column:1/-1;">
        Could not load case data. <button onclick="location.reload()" style="color:var(--accent);background:none;border:none;cursor:pointer;font:inherit;">Try refreshing</button>
      </p>`;
    }
    console.error('Failed to load f2l-cases.json:', err);
    return;
  }

  renderModeToggle();
  renderFilterBar();
  renderProgressBar(allCases.length);

  // Read hash once on page load for shareable URL support
  const hash = location.hash.replace('#', '') || 'all';
  activeFilter = CATEGORIES.find(c => c.id === hash) ? hash : 'all';
  applyMode();
  renderCases();
  updateFilterButtons();

  const resetBtn = document.getElementById('reset-progress-btn');
  resetBtn?.addEventListener('click', () => {
    if (!window.confirm('Reset all progress?')) return;
    resetProgress();
    renderProgressBar(allCases.length);
    refreshLearnedCount();
    renderCases();
  });
}

// ── Mode toggle ───────────────────────────────────────────

function renderModeToggle() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  const toggle = document.createElement('button');
  toggle.id = 'mode-toggle';
  toggle.className = 'mode-toggle-btn';
  toggle.setAttribute('aria-pressed', String(isLearningMode));
  toggle.setAttribute('aria-label', 'Toggle learning or reference mode');
  toggle.textContent = isLearningMode ? '📖 Learning' : '⚡ Reference';

  toggle.addEventListener('click', () => {
    isLearningMode = !isLearningMode;
    sessionStorage.setItem('f2l-mode', isLearningMode ? 'learning' : 'reference');
    toggle.setAttribute('aria-pressed', String(isLearningMode));
    toggle.textContent = isLearningMode ? '📖 Learning' : '⚡ Reference';
    applyMode();
    renderCases();
  });

  bar.parentElement.insertBefore(toggle, bar);
}

function applyMode() {
  document.body.classList.toggle('mode-reference', !isLearningMode);
  document.body.classList.toggle('mode-learning', isLearningMode);
}

// ── Filter bar ────────────────────────────────────────────

function renderFilterBar() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  CATEGORIES.forEach(cat => {
    const count = cat.id === 'all'     ? allCases.length
                : cat.id === 'learned' ? getLearnedSet().size
                : allCases.filter(c => c.category === cat.id).length;

    if (cat.id === 'learned') {
      const sep = document.createElement('span');
      sep.className = 'filter-sep';
      sep.setAttribute('aria-hidden', 'true');
      bar.appendChild(sep);
    }

    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat.id === 'learned' ? ' filter-btn-learned' : '');
    btn.dataset.filter = cat.id;
    btn.setAttribute('aria-pressed', cat.id === activeFilter ? 'true' : 'false');
    // No aria-label: accessible name = visible text ("Both in Top 15")
    // Count is aria-hidden so the accessible name is just the category label
    btn.innerHTML = `${cat.label} <span class="count" aria-hidden="true">${count}</span>`;
    btn.addEventListener('click', () => setFilter(cat.id));
    bar.appendChild(btn);
  });
}

function setFilter(id) {
  activeFilter = id;
  history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id);
  renderCases();
  updateFilterButtons();
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

// ── Case rendering ────────────────────────────────────────

function renderCases() {
  const grid = document.querySelector('.cases-grid');
  const countEl = document.querySelector('.cases-count');
  if (!grid) return;

  const learned = getLearnedSet();
  let visible = allCases.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'learned') return learned.has(c.id);
    return c.category === activeFilter;
  });

  // Sort by category order, then by subgroup within both-in-top.
  // Within the same subgroup (or non-both-in-top category) preserve original JSON order.
  const originalIndex = new Map(allCases.map((c, i) => [c.id, i]));
  visible = [...visible].sort((a, b) => {
    const catA = CATEGORY_ORDER[a.category] ?? 99;
    const catB = CATEGORY_ORDER[b.category] ?? 99;
    if (catA !== catB) return catA - catB;
    if (a.category === 'both-in-top') {
      const sgA = SUBGROUP_ORDER[a.subgroup] ?? 99;
      const sgB = SUBGROUP_ORDER[b.subgroup] ?? 99;
      if (sgA !== sgB) return sgA - sgB;
    }
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0);
  });

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${visible.length}</strong> of ${allCases.length} cases`;
  }

  const fragment = document.createDocumentFragment();
  let lastSubgroup = null;
  let displayNum = 0;

  visible.forEach(c => {
    displayNum++;
    if (c.category === 'both-in-top' && c.subgroup && c.subgroup !== lastSubgroup) {
      lastSubgroup = c.subgroup;
      const heading = document.createElement('div');
      heading.className = 'subgroup-heading';
      heading.setAttribute('aria-label', `Subgroup: ${SUBGROUPS[c.subgroup] || c.subgroup}`);
      heading.textContent = SUBGROUPS[c.subgroup] || c.subgroup;
      fragment.appendChild(heading);
    } else if (c.category !== 'both-in-top') {
      lastSubgroup = null;
    }
    fragment.appendChild(buildCard(c, learned.has(c.id), displayNum));
  });

  grid.replaceChildren(fragment);
  observeViewers();
}

function buildCard(c, isLearned, displayNum) {
  const card = document.createElement('article');
  card.className = 'case-card' + (isLearned ? ' learned' : '');
  card.setAttribute('aria-label', `Case ${c.id}: ${c.name}`);

  const badgeClass = `badge-${c.category}`;
  const badgeLabel = CATEGORIES.find(cat => cat.id === c.category)?.label ?? c.category;
  const mainAlg = c.algorithms[0];
  const altAlg  = c.algorithms[1];
  const moveCount = mainAlg.moves.trim().split(/\s+/).length;
  const recOpen = !isLearned; // open by default in learning mode, closed when learned

  card.innerHTML = `
    <div class="case-card-viewer">
      <div class="viewer-placeholder"
           data-setup="${escAttr(c.setup)}"
           data-alg="${escAttr(mainAlg.moves)}"
           role="img"
           aria-label="3D cube diagram for ${escAttr(c.name)}">
      </div>
    </div>

    <div class="viewer-controls">
      <button class="viewer-btn" data-action="play" aria-label="Play algorithm" disabled>▶ Play</button>
      <button class="viewer-btn" data-action="reset" aria-label="Reset to case position" disabled>↺ Reset</button>
    </div>

    <div class="case-card-body">
      <div class="case-card-header">
        <span class="case-id">#${displayNum}</span>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>

      <div class="case-name">${esc(c.name)}</div>

      <div>
        <div class="case-alg-label">Main Algorithm <span class="move-count">${moveCount} moves</span></div>
        <div class="case-alg-row">${renderAlg(mainAlg.moves)}</div>
        ${mainAlg.notes ? `<div class="case-notes">${esc(mainAlg.notes)}</div>` : ''}
      </div>

      ${altAlg ? `
      <div>
        <button class="alt-toggle" aria-expanded="false" aria-controls="alt-${c.id}">
          + Show alternate algorithm
        </button>
        <div class="alt-alg" id="alt-${c.id}" hidden>
          <div class="case-alg-label">${esc(altAlg.label)} <span class="move-count">${altAlg.moves.trim().split(/\s+/).length} moves</span></div>
          <div class="case-alg-row">${renderAlg(altAlg.moves)}</div>
          ${altAlg.notes ? `<div class="case-notes">${esc(altAlg.notes)}</div>` : ''}
        </div>
      </div>` : ''}

      ${c.shared_algorithm_note ? `
      <div class="shared-alg-note" aria-label="Shared algorithm note">
        <span class="shared-alg-icon" aria-hidden="true">⟳</span>${esc(c.shared_algorithm_note)}
      </div>` : ''}

      <div class="recognition-section">
        <button class="recognition-toggle ${recOpen ? 'open' : ''}"
                aria-expanded="${recOpen}"
                aria-controls="rec-${c.id}">
          How to recognize this case
        </button>
        <div class="recognition-text ${recOpen ? 'open' : ''}" id="rec-${c.id}" ${recOpen ? '' : 'hidden'}>
          ${formatRecognition(c.recognition)}
        </div>
      </div>

      <div class="setup-section">
        <button class="setup-toggle" aria-expanded="false" aria-controls="setup-${c.id}">
          Practice setup
        </button>
        <div class="setup-panel" id="setup-${c.id}" hidden>
          <p class="setup-desc">Apply to a fully solved cube to reach this case state:</p>
          <div class="setup-scramble">
            <code>${esc(c.setup)}</code>
            <button class="copy-btn" data-copy="${escAttr(c.setup)}" aria-label="Copy setup scramble">Copy</button>
          </div>
        </div>
      </div>

      <div class="case-card-footer">
        <button class="learned-btn ${isLearned ? 'done' : ''}"
                data-id="${c.id}"
                aria-pressed="${isLearned}">
          ${isLearned ? '✓ Learned' : '○ Mark learned'}
        </button>
      </div>
    </div>
  `;

  card.querySelector('.recognition-toggle')?.addEventListener('click', (e) => {
    toggleDisclosure(e.currentTarget, card.querySelector(`#rec-${c.id}`));
  });

  card.querySelector('.alt-toggle')?.addEventListener('click', (e) => {
    toggleDisclosure(e.currentTarget, card.querySelector(`#alt-${c.id}`));
  });

  card.querySelector('.setup-toggle')?.addEventListener('click', (e) => {
    toggleDisclosure(e.currentTarget, card.querySelector(`#setup-${c.id}`));
  });

  card.querySelector('.copy-btn')?.addEventListener('click', (e) => {
    const text = e.currentTarget.dataset.copy;
    navigator.clipboard?.writeText(text).then(() => {
      const btn = e.currentTarget;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
  });

  card.querySelector('.learned-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const nowLearned = !btn.classList.contains('done');
    setLearned(id, nowLearned);
    btn.classList.toggle('done', nowLearned);
    btn.setAttribute('aria-pressed', String(nowLearned));
    btn.textContent = nowLearned ? '✓ Learned' : '○ Mark learned';
    card.classList.toggle('learned', nowLearned);
    renderProgressBar(allCases.length);
    refreshLearnedCount();

    // Collapse recognition hint when learned, expand when unlearned
    const recToggle = card.querySelector('.recognition-toggle');
    const recPanel  = card.querySelector(`#rec-${id}`);
    if (recToggle && recPanel) {
      const shouldShow = !nowLearned;
      recToggle.classList.toggle('open', shouldShow);
      recToggle.setAttribute('aria-expanded', String(shouldShow));
      recPanel.hidden = !shouldShow;
      recPanel.classList.toggle('open', shouldShow);
    }
  });

  wireViewerControls(card);
  return card;
}

function refreshLearnedCount() {
  document.querySelectorAll('.filter-btn .count').forEach(span => {
    const filterId = span.closest('.filter-btn')?.dataset.filter;
    if (!filterId) return;
    if (filterId === 'learned') {
      span.textContent = getLearnedSet().size;
    } else if (filterId === 'all') {
      span.textContent = allCases.length;
    }
  });
}

// ── Recognition hint formatter ────────────────────────────
// Converts newline-delimited FIND/WHITE/EDGE/CONFIRM lines into labeled HTML

function formatRecognition(text) {
  if (!text) return '';
  return text.split('\n').map(line => {
    const match = line.match(/^(FIND|WHITE|EDGE|CONFIRM|CORNER|RESULT|CHECK):\s*(.*)/);
    if (match) {
      return `<div class="rec-line"><span class="rec-label">${esc(match[1])}</span><span class="rec-body">${esc(match[2])}</span></div>`;
    }
    return `<p class="rec-prose">${esc(line)}</p>`;
  }).join('');
}

// ── Algorithm chip renderer ───────────────────────────────

function renderAlg(movesStr) {
  return movesStr.trim().split(/\s+/).map(token => {
    const face = token[0].toUpperCase();
    const modifier = token.endsWith("'") ? 'prime' : token.endsWith('2') ? 'double' : '';
    const bg    = FACE_BG[face]   || 'var(--bg-elevated)';
    const color = FACE_TEXT[face] || 'var(--text-primary)';
    return `<span class="move move-${face}" data-modifier="${modifier}"
                  style="background:${bg};color:${color};"
                  aria-label="${esc(token)}">${esc(token)}</span>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────────

function toggleDisclosure(trigger, panel) {
  if (!panel) return;
  const open = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', String(!open));
  trigger.classList.toggle('open', !open);
  panel.hidden = open;
  panel.classList.toggle('open', !open);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

init();
