import { getLearnedSet, setLearned, renderProgressBar } from './progress.js';
import { observeViewers, wireViewerControls } from './viewer.js';

const CATEGORIES = [
  { id: 'all',            label: 'All' },
  { id: 'easy',           label: 'Easy' },
  { id: 'both-in-top',    label: 'Both in Top' },
  { id: 'corner-in-slot', label: 'Corner in Slot' },
  { id: 'edge-in-top',    label: 'Edge in Top' },
  { id: 'advanced',       label: 'Advanced' },
  { id: 'learned',        label: 'Learned' },
];

const FACE_COLORS = { U: '#FFD500', R: '#E03030', F: '#30A030', D: '#e8e8e8', L: '#E07820', B: '#3060E0' };
const FACE_TEXT   = { U: '#000',    R: '#fff',    F: '#fff',    D: '#000',    L: '#fff',    B: '#fff' };

let allCases = [];
let activeFilter = 'all';

async function init() {
  const res = await fetch('data/f2l-cases.json');
  const { cases } = await res.json();
  allCases = cases;

  renderFilterBar();
  renderProgressBar(allCases.length);
  applyFilterFromHash();

  window.addEventListener('hashchange', applyFilterFromHash);
}

// ── Filter bar ────────────────────────────────────────────

function renderFilterBar() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  CATEGORIES.forEach(cat => {
    const count = cat.id === 'all' ? allCases.length
                : cat.id === 'learned' ? getLearnedSet().size
                : allCases.filter(c => c.category === cat.id).length;

    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = cat.id;
    btn.setAttribute('aria-label', `Filter by ${cat.label}`);
    btn.innerHTML = `${cat.label} <span class="count">${count}</span>`;
    btn.addEventListener('click', () => setFilter(cat.id));
    bar.appendChild(btn);
  });
}

function setFilter(id) {
  activeFilter = id;
  location.hash = id === 'all' ? '' : id;
  renderCases();
  updateFilterButtons();
}

function applyFilterFromHash() {
  const hash = location.hash.replace('#', '') || 'all';
  activeFilter = CATEGORIES.find(c => c.id === hash) ? hash : 'all';
  renderCases();
  updateFilterButtons();
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  });
}

// ── Case rendering ────────────────────────────────────────

function renderCases() {
  const grid = document.querySelector('.cases-grid');
  const countEl = document.querySelector('.cases-count');
  if (!grid) return;

  const learned = getLearnedSet();
  const visible = allCases.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'learned') return learned.has(c.id);
    return c.category === activeFilter;
  });

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${visible.length}</strong> of ${allCases.length} cases`;
  }

  grid.innerHTML = '';
  visible.forEach(c => {
    const card = buildCard(c, learned.has(c.id));
    grid.appendChild(card);
  });

  observeViewers();
}

function buildCard(c, isLearned) {
  const card = document.createElement('article');
  card.className = 'case-card' + (isLearned ? ' learned' : '');
  card.setAttribute('aria-label', `Case ${c.id}: ${c.name}`);

  const badgeClass = `badge-${c.category}`;
  const badgeLabel = CATEGORIES.find(cat => cat.id === c.category)?.label ?? c.category;

  const mainAlg = c.algorithms[0];
  const altAlg  = c.algorithms[1];

  card.innerHTML = `
    <div class="case-card-viewer">
      <div class="viewer-placeholder"
           data-scramble="${escAttr(c.scramble)}"
           data-alg="${escAttr(mainAlg.moves)}"
           role="img"
           aria-label="3D cube diagram for ${escAttr(c.name)}">
      </div>
    </div>

    <div class="viewer-controls">
      <button class="viewer-btn" data-action="play" aria-label="Play algorithm">▶ Play</button>
      <button class="viewer-btn" data-action="reset" aria-label="Reset to case position">↺ Reset</button>
    </div>

    <div class="case-card-body">
      <div class="case-card-header">
        <span class="case-id">#${c.id.replace('f2l-', '')}</span>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>

      <div>
        <div class="case-alg-label">Main Algorithm</div>
        <div class="case-alg-row">${renderAlg(mainAlg.moves)}</div>
        ${mainAlg.notes ? `<div style="font-size:var(--text-xs);color:var(--text-subtle);margin-top:4px;">${esc(mainAlg.notes)}</div>` : ''}
      </div>

      ${altAlg ? `
      <div>
        <button class="alt-toggle" aria-expanded="false" aria-controls="alt-${c.id}">
          + Show alternate algorithm
        </button>
        <div class="alt-alg" id="alt-${c.id}" hidden>
          <div class="case-alg-label">${esc(altAlg.label)}</div>
          <div class="case-alg-row">${renderAlg(altAlg.moves)}</div>
          ${altAlg.notes ? `<div style="font-size:var(--text-xs);color:var(--text-subtle);margin-top:4px;">${esc(altAlg.notes)}</div>` : ''}
        </div>
      </div>` : ''}

      <div>
        <button class="recognition-toggle" aria-expanded="false" aria-controls="rec-${c.id}">
          How to recognize this case
        </button>
        <div class="recognition-text" id="rec-${c.id}" hidden>
          ${esc(c.recognition)}
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:var(--space-2);">
        <button class="learned-btn ${isLearned ? 'done' : ''}"
                data-id="${c.id}"
                aria-pressed="${isLearned}"
                aria-label="Mark case ${c.id} as ${isLearned ? 'not learned' : 'learned'}">
          ${isLearned ? '✓ Learned' : '○ Mark learned'}
        </button>
      </div>
    </div>
  `;

  // Wire toggles
  card.querySelector('.recognition-toggle')?.addEventListener('click', (e) => {
    toggleDisclosure(e.currentTarget, card.querySelector(`#rec-${c.id}`));
  });

  card.querySelector('.alt-toggle')?.addEventListener('click', (e) => {
    toggleDisclosure(e.currentTarget, card.querySelector(`#alt-${c.id}`));
  });

  // Learned button
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
  });

  wireViewerControls(card);
  return card;
}

function refreshLearnedCount() {
  const btn = document.querySelector('[data-filter="learned"] .count');
  if (btn) btn.textContent = getLearnedSet().size;
}

// ── Algorithm chip renderer ───────────────────────────────

function renderAlg(movesStr) {
  return movesStr.trim().split(/\s+/).map(token => {
    const face = token[0].toUpperCase();
    const modifier = token.includes("'") ? 'prime' : token.includes('2') ? 'double' : '';
    const bg   = FACE_COLORS[face] || 'var(--bg-elevated)';
    const color = FACE_TEXT[face] || 'var(--text-primary)';
    const label = esc(token);
    return `<span class="move move-${face}" data-modifier="${modifier}"
                  style="background:${bg};color:${color};"
                  aria-label="${label}">${label}</span>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────────

function toggleDisclosure(trigger, panel) {
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
