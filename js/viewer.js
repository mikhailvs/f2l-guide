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
  const player = document.createElement('twisty-player');
  player.setAttribute('puzzle', '3x3x3');
  player.setAttribute('alg', alg || '');
  player.setAttribute('experimental-setup-alg', setup || '');
  player.setAttribute('hint-facelets', 'none');
  player.setAttribute('back-view', 'none');
  player.setAttribute('control-panel', 'none');
  player.setAttribute('camera-latitude', '-30');
  player.setAttribute('camera-longitude', '30');

  // Preserve accessible name from placeholder
  player.setAttribute('role', placeholder.getAttribute('role') || 'img');
  const label = placeholder.getAttribute('aria-label');
  if (label) player.setAttribute('aria-label', label);

  placeholder.replaceWith(player);

  // Enable controls now that the player exists
  const card = player.closest('.case-card');
  if (card) {
    card.querySelectorAll('.viewer-btn[disabled]').forEach(btn => btn.removeAttribute('disabled'));
  }
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
