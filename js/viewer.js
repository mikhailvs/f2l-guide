// Lazy-initializes twisty-player elements when they scroll into view.
// Without this, 41 players would all animate on page load.

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const placeholder = entry.target;
    initPlayer(placeholder);
    observer.unobserve(placeholder);
  });
}, { rootMargin: '200px' });

export function observeViewers() {
  document.querySelectorAll('.viewer-placeholder').forEach(el => observer.observe(el));
}

function initPlayer(placeholder) {
  const { scramble, alg } = placeholder.dataset;
  const player = document.createElement('twisty-player');
  player.setAttribute('puzzle', '3x3x3');
  player.setAttribute('alg', alg || '');
  player.setAttribute('experimental-setup-alg', scramble || '');
  player.setAttribute('hint-facelets', 'none');
  player.setAttribute('back-view', 'none');
  player.setAttribute('control-panel', 'none');
  player.setAttribute('camera-latitude', '-30');
  player.setAttribute('camera-longitude', '30');
  placeholder.replaceWith(player);
}

export function wireViewerControls(card) {
  const playBtn = card.querySelector('[data-action="play"]');
  const resetBtn = card.querySelector('[data-action="reset"]');

  playBtn?.addEventListener('click', async () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    await player.experimentalModel.twistySceneModel.puzzleManager.clear?.();
    player.timestamp = 0;
    player.play();
  });

  resetBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.timestamp = 0;
  });
}
