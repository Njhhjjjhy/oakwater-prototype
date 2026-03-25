const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

// ── Hero word-by-word entrance ──
setTimeout(() => {
  document.querySelectorAll('.hero-word').forEach(w => w.classList.add('animate'));
}, 200);

// iOS body scroll lock helper
let scrollPos = 0;
function lockScroll() {
  scrollPos = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPos}px`;
  document.body.style.width = '100%';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollPos);
}

const hamburger = document.getElementById('hamburger');
const mm = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mm.classList.toggle('open');
  const isOpen = mm.classList.contains('open');
  if (isOpen) { lockScroll(); } else { unlockScroll(); }
  hamburger.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) mm.querySelector('a').focus();
});
mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('active'); mm.classList.remove('open');
  unlockScroll();
}));

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Approach grid cascade
const aGrid = document.querySelector('.approach-a-grid');
if (aGrid) {
  const gridObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.approach-a-card').forEach(el => {
          el.style.animationPlayState = 'running';
        });
        gridObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  gridObs.observe(aGrid);
}

function toggle(header) {
  const m = header.closest('.team-member');
  const wasOpen = m.classList.contains('open');
  document.querySelectorAll('.team-member.open').forEach(o => {
    if (o !== m) {
      o.classList.remove('open');
      o.querySelector('.team-header').setAttribute('aria-expanded', 'false');
    }
  });
  m.classList.toggle('open', !wasOpen);
  header.setAttribute('aria-expanded', String(!wasOpen));
}

// Touch-friendly: close team accordion on outside tap
document.addEventListener('touchstart', (e) => {
  if (!e.target.closest('.team-member')) {
    document.querySelectorAll('.team-member.open').forEach(m => {
      m.classList.remove('open');
      m.querySelector('.team-header').setAttribute('aria-expanded', 'false');
    });
  }
}, { passive: true });

// iOS: handle orientation change
window.addEventListener('orientationchange', () => {
  // Force recalculate viewport height after orientation change
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}, { passive: true });

// Set initial --vh for iOS
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
window.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}, { passive: true });

// Mobile menu focus trap
document.addEventListener('keydown', (e) => {
  if (!mm.classList.contains('open')) return;
  if (e.key === 'Escape') {
    hamburger.classList.remove('active');
    mm.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
    return;
  }
  if (e.key !== 'Tab') return;
  const focusable = mm.querySelectorAll('a');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});
