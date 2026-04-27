// ── Global speed state ────────────────────────────────────

let globalSpeed = parseFloat(sessionStorage.getItem('f2l-speed') || '1');

export function getGlobalSpeed() { return globalSpeed; }

export function setGlobalSpeed(scale) {
  globalSpeed = scale;
  sessionStorage.setItem('f2l-speed', String(scale));
  document.querySelectorAll('twisty-player').forEach(p => {
    p.setAttribute('tempo-scale', String(scale));
  });
  for (const state of activePlayers.values()) {
    state.estimatedMax = state.baseDuration / scale;
  }
}

// ── Default camera ────────────────────────────────────────

const DEFAULT_CAM_LAT = -30;
const DEFAULT_CAM_LNG = 30;

function resetCamera(player) {
  player.setAttribute('camera-latitude',  String(DEFAULT_CAM_LAT));
  player.setAttribute('camera-longitude', String(DEFAULT_CAM_LNG));
}

// ── Active player registry (for scrubber sync loop) ───────

const activePlayers = new Map(); // player → { scrubber, baseDuration, estimatedMax }
let rafId = null;

function startUpdateLoop() {
  if (rafId !== null) return;
  function tick() {
    let any = false;
    for (const [player, state] of activePlayers) {
      if (!player.isConnected) { activePlayers.delete(player); continue; }
      any = true;
      if (state.scrubber) {
        const ts = player.timestamp ?? 0;
        const pct = state.estimatedMax > 0
          ? Math.min(100, (ts / state.estimatedMax) * 100)
          : 0;
        if (document.activeElement !== state.scrubber) {
          state.scrubber.value = pct;
          state.scrubber.style.setProperty('--progress', `${pct}%`);
        }
      }
    }
    rafId = any ? requestAnimationFrame(tick) : null;
  }
  rafId = requestAnimationFrame(tick);
}

// ── Lazy init ─────────────────────────────────────────────

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    initPlayer(entry.target);
    observer.unobserve(entry.target);
  });
}, { rootMargin: '200px' });

export function observeViewers() {
  document.querySelectorAll('.viewer-placeholder').forEach(el => observer.observe(el));
}

function initPlayer(placeholder) {
  const { setup, alg } = placeholder.dataset;
  const ariaLabel = placeholder.getAttribute('aria-label') || '';
  const moveCount = (alg || '').trim().split(/\s+/).filter(Boolean).length || 1;

  const player = document.createElement('twisty-player');
  player.setAttribute('puzzle', '3x3x3');
  player.setAttribute('alg', alg || '');
  player.setAttribute('experimental-setup-alg', setup || '');
  player.setAttribute('hint-facelets', 'none');
  player.setAttribute('back-view', 'none');
  player.setAttribute('control-panel', 'none');
  player.setAttribute('camera-latitude',  String(DEFAULT_CAM_LAT));
  player.setAttribute('camera-longitude', String(DEFAULT_CAM_LNG));
  player.setAttribute('background', 'none');
  player.setAttribute('tempo-scale', String(globalSpeed));
  player.setAttribute('role', 'img');
  if (ariaLabel) player.setAttribute('aria-label', ariaLabel);

  placeholder.replaceWith(player);

  const baseDuration = moveCount * 1000;
  const estimatedMax = baseDuration / globalSpeed;
  activePlayers.set(player, { scrubber: null, baseDuration, estimatedMax });
  startUpdateLoop();

  const card = player.closest('.case-card');
  if (card) {
    card.querySelectorAll('.viewer-btn[disabled], .viewer-scrubber[disabled]')
        .forEach(el => el.removeAttribute('disabled'));

    const scrubber = card.querySelector('.viewer-scrubber');
    if (scrubber) {
      activePlayers.get(player).scrubber = scrubber;
      scrubber.addEventListener('input', () => {
        player.pause?.();
        const pct = parseFloat(scrubber.value);
        player.timestamp = (pct / 100) * estimatedMax;
        scrubber.style.setProperty('--progress', `${pct}%`);
        const playBtn = card.querySelector('[data-action="play"]');
        if (playBtn) playBtn.textContent = '▶';
      });
    }
  }

  player.addEventListener('error', () => showViewerFallback(player, setup, ariaLabel), { once: true });
}

function showViewerFallback(player, setup, ariaLabel) {
  if (!player.isConnected) return;
  activePlayers.delete(player);
  const fallback = document.createElement('div');
  fallback.className = 'viewer-fallback';
  fallback.setAttribute('role', 'img');
  if (ariaLabel) fallback.setAttribute('aria-label', ariaLabel);
  fallback.innerHTML = `
    <p class="viewer-fallback-label">3D viewer unavailable</p>
    ${setup ? `<p class="viewer-fallback-setup">Setup: <code>${setup}</code></p>` : ''}
  `;
  player.replaceWith(fallback);
}

// ── Per-card viewer controls ──────────────────────────────

export function wireViewerControls(card) {
  const playBtn    = card.querySelector('[data-action="play"]');
  const resetBtn   = card.querySelector('[data-action="reset"]');
  const camBtn     = card.querySelector('[data-action="reset-camera"]');
  const scrubber   = card.querySelector('.viewer-scrubber');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let playing = false;

  function setPlaying(state) {
    playing = state;
    if (playBtn) playBtn.textContent = playing ? '⏸' : '▶';
  }

  function doResetAnimation(player) {
    player.pause?.();
    player.timestamp = 0;
    if (scrubber) {
      scrubber.value = 0;
      scrubber.style.setProperty('--progress', '0%');
    }
    setPlaying(false);
  }

  playBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;

    if (playing) {
      player.pause?.();
      setPlaying(false);
    } else {
      if (prefersReducedMotion.matches) {
        const state = activePlayers.get(player);
        player.timestamp = state?.estimatedMax ?? 9999;
        if (scrubber) scrubber.value = 100;
      } else {
        player.play();
        setPlaying(true);
        const state = activePlayers.get(player);
        if (state) {
          const checkEnd = () => {
            if (!player.isConnected || !playing) return;
            if (player.timestamp >= state.estimatedMax * 0.98) {
              setPlaying(false);
            } else {
              requestAnimationFrame(checkEnd);
            }
          };
          requestAnimationFrame(checkEnd);
        }
      }
    }
  });

  // Reset: animation back to start + camera back to default
  resetBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    doResetAnimation(player);
    resetCamera(player);
  });

  // Camera-only reset: restore angle without touching animation position
  camBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    resetCamera(player);
  });
}
