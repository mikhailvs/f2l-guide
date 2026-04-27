// ── Global speed state ────────────────────────────────────

let globalSpeed = parseFloat(sessionStorage.getItem('f2l-speed') || '1');

export function getGlobalSpeed() { return globalSpeed; }

export function setGlobalSpeed(scale) {
  globalSpeed = scale;
  sessionStorage.setItem('f2l-speed', String(scale));
  document.querySelectorAll('twisty-player').forEach(p => {
    p.setAttribute('tempo-scale', String(scale));
  });
  // Update estimatedMax for all registered players (tempo-scale changes duration)
  for (const state of activePlayers.values()) {
    state.estimatedMax = state.baseDuration / scale;
  }
}

// ── Active player registry (for scrubber sync loop) ───────

// player → { scrubber, baseDuration, estimatedMax }
const activePlayers = new Map();
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
        // Only update if not being dragged (avoid fighting the user)
        if (document.activeElement !== state.scrubber) {
          state.scrubber.value = pct;
          // Update the track fill gradient via CSS custom property
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
  player.setAttribute('camera-latitude', '-30');
  player.setAttribute('camera-longitude', '30');
  player.setAttribute('background', 'none');               // transparent → card bg shows through
  player.setAttribute('tempo-scale', String(globalSpeed));
  player.setAttribute('role', 'img');
  if (ariaLabel) player.setAttribute('aria-label', ariaLabel);

  placeholder.replaceWith(player);

  // Register player for scrubber sync
  const baseDuration = moveCount * 1000; // ~1000ms per move at 1x
  const estimatedMax = baseDuration / globalSpeed;
  activePlayers.set(player, { scrubber: null, baseDuration, estimatedMax });
  startUpdateLoop();

  // Enable controls now that player exists
  const card = player.closest('.case-card');
  if (card) {
    card.querySelectorAll('.viewer-btn[disabled], .viewer-scrubber[disabled]')
        .forEach(el => el.removeAttribute('disabled'));
    // Wire scrubber to this player
    const scrubber = card.querySelector('.viewer-scrubber');
    if (scrubber) {
      activePlayers.get(player).scrubber = scrubber;
      scrubber.addEventListener('input', () => {
        player.pause?.();
        const pct = parseFloat(scrubber.value);
        player.timestamp = (pct / 100) * estimatedMax;
        scrubber.style.setProperty('--progress', `${pct}%`);
        // Reset play button icon when scrubbing
        const playBtn = card.querySelector('[data-action="play"]');
        if (playBtn) playBtn.textContent = '▶';
      });
    }
  }

  // Catch WebGL failures (headless, privacy modes, old hardware)
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
  const playBtn  = card.querySelector('[data-action="play"]');
  const resetBtn = card.querySelector('[data-action="reset"]');
  const scrubber = card.querySelector('.viewer-scrubber');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let playing = false;

  function setPlaying(state) {
    playing = state;
    if (playBtn) playBtn.textContent = playing ? '⏸' : '▶';
  }

  playBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;

    if (playing) {
      player.pause?.();
      setPlaying(false);
    } else {
      if (prefersReducedMotion.matches) {
        player.timestamp = activePlayers.get(player)?.estimatedMax ?? 9999;
        if (scrubber) scrubber.value = 100;
      } else {
        player.timestamp = player.timestamp ?? 0;
        player.play();
        setPlaying(true);
        // Auto-reset play button when animation ends
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

  resetBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.pause?.();
    player.timestamp = 0;
    if (scrubber) scrubber.value = 0;
    setPlaying(false);
  });
}
