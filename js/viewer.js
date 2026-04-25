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

  const player = document.createElement('twisty-player');
  player.setAttribute('puzzle', '3x3x3');
  player.setAttribute('alg', alg || '');
  player.setAttribute('experimental-setup-alg', setup || '');
  player.setAttribute('hint-facelets', 'none');
  player.setAttribute('back-view', 'none');
  player.setAttribute('control-panel', 'none');
  player.setAttribute('camera-latitude', '-30');
  player.setAttribute('camera-longitude', '30');
  player.setAttribute('role', 'img');
  if (ariaLabel) player.setAttribute('aria-label', ariaLabel);

  placeholder.replaceWith(player);

  // Enable viewer controls
  const card = player.closest('.case-card');
  if (card) {
    card.querySelectorAll('.viewer-btn[disabled]').forEach(btn => btn.removeAttribute('disabled'));
  }

  // Catch WebGL failures (headless browsers, privacy modes, old GPUs) and
  // replace the player with a text fallback showing the setup scramble.
  player.addEventListener('error', () => showViewerFallback(player, setup, ariaLabel), { once: true });

  // Delay check: if player hasn't rendered after 3s and is still empty, show fallback.
  setTimeout(() => {
    if (player.isConnected && !player.shadowRoot?.querySelector('canvas')) {
      showViewerFallback(player, setup, ariaLabel);
    }
  }, 3000);
}

function showViewerFallback(player, setup, ariaLabel) {
  if (!player.isConnected) return;
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

export function wireViewerControls(card) {
  const playBtn = card.querySelector('[data-action="play"]');
  const resetBtn = card.querySelector('[data-action="reset"]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  playBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.timestamp = 0;
    if (prefersReducedMotion.matches) {
      player.jumpToEnd();
    } else {
      player.play();
    }
  });

  resetBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.timestamp = 0;
  });
}
