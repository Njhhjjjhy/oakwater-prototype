// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

// ── Reduced motion check ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Hero entrance — anime.js spring ──
if (!prefersReducedMotion) {
  // Words spring up with overshoot
  anime.animate('.hero-word', {
    translateY: [60, 0],
    opacity: [0, 1],
    duration: 1200,
    ease: anime.spring({ stiffness: 90, damping: 14 }),
    delay: anime.stagger(180, { start: 300 }),
  });
} else {
  document.querySelectorAll('.hero-word').forEach(w => {
    w.style.opacity = '1';
    w.style.transform = 'none';
  });
}

// ── iOS body scroll lock helper ──
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

// ── Mobile menu ──
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

// ── Scroll-triggered reveal (base) ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── Section labels — border grows + text appears ──
if (!prefersReducedMotion) {
  document.querySelectorAll('.section-label').forEach(label => {
    // Start with no border
    label.style.borderLeftWidth = '0px';
    const labelObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Border grows
          anime.animate(label, {
            borderLeftWidth: [0, 4],
            duration: 600,
            ease: 'outExpo',
          });
          labelObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    labelObs.observe(label);
  });
}

// ── Investment card SVG animations ──
if (!prefersReducedMotion) {
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const card = e.target;
      const svg = card.querySelector('.invest-card-illustration svg');
      if (!svg) return;

      const cardIndex = card.style.getPropertyValue('--i');

      if (cardIndex === '0') {
        // AI card — pulse neural circles, draw connection lines
        const circles = svg.querySelectorAll('circle');
        const lines = svg.querySelectorAll('line');
        anime.animate(circles, {
          opacity: [0, function(_, i) { return circles[i].getAttribute('opacity') || 0.5; }],
          scale: [0, 1],
          duration: 800,
          ease: anime.spring({ stiffness: 120, damping: 12 }),
          delay: anime.stagger(80, { start: 200 }),
        });
        anime.animate(lines, {
          opacity: [0, 0.3],
          duration: 600,
          delay: anime.stagger(100, { start: 500 }),
          ease: 'outExpo',
        });
        // Pulse the corner connector circles
        const connectors = svg.querySelectorAll('circle[r="4"]');
        anime.animate(connectors, {
          scale: [0, 1],
          duration: 600,
          ease: anime.spring({ stiffness: 200, damping: 10 }),
          delay: anime.stagger(100, { start: 600 }),
        });
      }

      if (cardIndex === '1') {
        // Environment card — draw globe outline, rotate ellipse feel
        const mainCircle = svg.querySelector('circle[r="70"][stroke]');
        const ellipse = svg.querySelector('ellipse');
        const paths = svg.querySelectorAll('path');
        if (mainCircle) {
          const circumference = 2 * Math.PI * 70;
          mainCircle.setAttribute('stroke-dasharray', circumference);
          mainCircle.setAttribute('stroke-dashoffset', circumference);
          anime.animate(mainCircle, {
            strokeDashoffset: [circumference, 0],
            duration: 1400,
            ease: 'outExpo',
            delay: 100,
          });
        }
        anime.animate(paths, {
          opacity: [0, function(_, i) { return paths[i].getAttribute('opacity') || 0.3; }],
          duration: 800,
          delay: anime.stagger(120, { start: 400 }),
          ease: 'outQuad',
        });
        if (ellipse) {
          anime.animate(ellipse, {
            opacity: [0, 0.4],
            duration: 800,
            delay: 300,
            ease: 'outQuad',
          });
        }
      }

      if (cardIndex === '2') {
        // Health card — draw heartbeat line, pulse heart
        const heartFill = svg.querySelector('path[fill]');
        const heartStroke = svg.querySelector('path[stroke-width="2.5"]');
        const heartbeat = svg.querySelector('path[stroke-width="3"]');
        const dots = svg.querySelectorAll('circle');

        // Heart scales in
        if (heartFill) {
          anime.animate(heartFill, {
            scale: [0.5, 1],
            opacity: [0, 0.15],
            duration: 1000,
            ease: anime.spring({ stiffness: 80, damping: 12 }),
            delay: 100,
          });
        }
        if (heartStroke) {
          const len = heartStroke.getTotalLength ? heartStroke.getTotalLength() : 600;
          heartStroke.setAttribute('stroke-dasharray', len);
          heartStroke.setAttribute('stroke-dashoffset', len);
          anime.animate(heartStroke, {
            strokeDashoffset: [len, 0],
            duration: 1200,
            ease: 'outExpo',
            delay: 200,
          });
        }
        // Heartbeat line draws
        if (heartbeat) {
          const hbLen = heartbeat.getTotalLength ? heartbeat.getTotalLength() : 400;
          heartbeat.setAttribute('stroke-dasharray', hbLen);
          heartbeat.setAttribute('stroke-dashoffset', hbLen);
          anime.animate(heartbeat, {
            strokeDashoffset: [hbLen, 0],
            duration: 1400,
            ease: 'outQuad',
            delay: 500,
          });
        }
        // Dots pop in
        anime.animate(dots, {
          scale: [0, 1],
          opacity: [0, function(_, i) { return dots[i].getAttribute('opacity') || 0.3; }],
          duration: 600,
          ease: anime.spring({ stiffness: 200, damping: 10 }),
          delay: anime.stagger(150, { start: 800 }),
        });
      }

      // Tags cascade in
      const tags = card.querySelectorAll('.invest-card-tags li');
      if (tags.length) {
        anime.animate(tags, {
          translateX: [20, 0],
          opacity: [0, 1],
          duration: 600,
          ease: 'outExpo',
          delay: anime.stagger(80, { start: 600 }),
        });
      }

      cardObserver.unobserve(card);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.invest-card').forEach(card => cardObserver.observe(card));
}

// ── Quote reveal — spring words + line draw ──
const quoteWrap = document.querySelector('.story-quote-wrap');
if (quoteWrap) {
  const quoteObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');

      if (!prefersReducedMotion) {
        const words = e.target.querySelectorAll('.quote-word');
        // Kill CSS transitions, let anime.js handle it
        words.forEach(w => {
          w.style.transition = 'none';
          w.style.opacity = '0';
          w.style.transform = 'translateY(40px)';
        });
        anime.animate(words, {
          translateY: [40, 0],
          opacity: [0, 1],
          duration: 1000,
          ease: anime.spring({ stiffness: 70, damping: 11 }),
          delay: anime.stagger(120, { start: 100 }),
        });
      }

      quoteObs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  quoteObs.observe(quoteWrap);
}

// ── Approach grid — anime.js wave stagger + icon stroke draw ──
const aGrid = document.querySelector('.approach-a-grid');
if (aGrid) {
  const gridObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const cards = e.target.querySelectorAll('.approach-a-card');

      if (!prefersReducedMotion) {
        // Kill CSS animation, let anime.js handle
        cards.forEach(c => {
          c.style.animation = 'none';
          c.style.opacity = '0';
          c.style.transform = 'translateY(16px)';
        });

        anime.animate(cards, {
          translateY: [16, 0],
          opacity: [0, 1],
          duration: 700,
          ease: anime.spring({ stiffness: 100, damping: 14 }),
          delay: anime.stagger(50, { start: 100 }),
        });

        // Draw icon strokes
        cards.forEach((card, i) => {
          const paths = card.querySelectorAll('svg path, svg circle, svg line, svg polyline, svg rect');
          paths.forEach(p => {
            if (p.getTotalLength) {
              const len = p.getTotalLength();
              p.setAttribute('stroke-dasharray', len);
              p.setAttribute('stroke-dashoffset', len);
              anime.animate(p, {
                strokeDashoffset: [len, 0],
                duration: 800,
                ease: 'outExpo',
                delay: 200 + i * 50,
              });
            }
          });
        });
      } else {
        cards.forEach(el => {
          el.style.animationPlayState = 'running';
        });
      }

      gridObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  gridObs.observe(aGrid);
}

// ── Team accordion ──
function toggle(header) {
  const m = header.closest('.team-member');
  const wasOpen = m.classList.contains('open');

  // Close others
  document.querySelectorAll('.team-member.open').forEach(o => {
    if (o !== m) {
      o.classList.remove('open');
      o.querySelector('.team-header').setAttribute('aria-expanded', 'false');
    }
  });

  m.classList.toggle('open', !wasOpen);
  header.setAttribute('aria-expanded', String(!wasOpen));

  // Spring the bio content in
  if (!wasOpen && !prefersReducedMotion) {
    const bio = m.querySelector('.team-bio');
    if (bio) {
      const paragraphs = bio.querySelectorAll('p');
      anime.animate(paragraphs, {
        translateY: [12, 0],
        opacity: [0, 1],
        duration: 600,
        ease: anime.spring({ stiffness: 120, damping: 14 }),
        delay: anime.stagger(60, { start: 150 }),
      });
    }
  }
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

// ── iOS viewport height ──
window.addEventListener('orientationchange', () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}, { passive: true });
document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
window.addEventListener('resize', () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}, { passive: true });

// ── Mobile menu focus trap ──
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
