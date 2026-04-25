const btn = document.querySelector('.nav-menu-btn');
const links = document.querySelector('.nav-links');

if (btn && links) {
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

// Mark active nav link
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    a.classList.add('active');
    a.ariaCurrent = 'page';
  }
});
