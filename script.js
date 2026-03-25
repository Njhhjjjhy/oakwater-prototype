// ── Nav scroll state ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

// ── Reduced motion check ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Hero entrance — choreographed timeline ──
if (!prefersReducedMotion) {
  const heroTl = anime.createTimeline({
    defaults: { ease: anime.spring({ stiffness: 70, damping: 13 }) },
  });
  // Words spring up sequentially
  heroTl.add('.hw-1', { translateY: [60, 0], opacity: [0, 1], duration: 1000 }, 300);
  heroTl.add('.hw-2', { translateY: [60, 0], opacity: [0, 1], duration: 1000 }, 480);
  heroTl.add('.hw-3', { translateY: [60, 0], opacity: [0, 1], duration: 1000 }, 660);
  // Subtitle slides in from further away, slightly delayed
  heroTl.add('.hw-4', { translateY: [40, 0], opacity: [0, 1], duration: 1200, ease: anime.spring({ stiffness: 50, damping: 15 }) }, 900);
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
  document.scrollingElement.scrollTop = scrollPos;
}

// ── Mobile menu ──
const hamburger = document.getElementById('hamburger');
const mm = document.getElementById('mobile-menu');
const hbSpans = hamburger.querySelectorAll('span');
const mmLinks = mm.querySelectorAll('a');
let closeTimer = null;

// Set clip-path origin to exact hamburger button center (relative to menu element)
function updateMenuOrigin() {
  const btnRect = hamburger.getBoundingClientRect();
  const menuRect = mm.getBoundingClientRect();
  const x = (btnRect.left + btnRect.width / 2) - menuRect.left;
  const y = (btnRect.top + btnRect.height / 2) - menuRect.top;
  mm.style.setProperty('--menu-x', x + 'px');
  mm.style.setProperty('--menu-y', y + 'px');
}
updateMenuOrigin();

function openMenu() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  updateMenuOrigin();
  hamburger.classList.add('active');
  mm.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  lockScroll();

  // Hamburger icon → X
  anime.animate(hbSpans[0], {
    translateY: [0, 6.5],
    rotate: [0, 45],
    duration: 700,
    ease: anime.spring({ stiffness: 70, damping: 15 }),
  });
  anime.animate(hbSpans[1], {
    scaleX: [1, 0],
    duration: 200,
    ease: 'outQuad',
  });
  anime.animate(hbSpans[2], {
    translateY: [0, -6.5],
    rotate: [0, -45],
    duration: 700,
    ease: anime.spring({ stiffness: 70, damping: 15 }),
  });

  // Links slide up with staggered delays (like the Framer Motion reference)
  mmLinks.forEach(a => {
    a.style.transform = 'translateY(30px)';
    a.style.opacity = '0';
  });
  anime.animate(mmLinks, {
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    ease: anime.spring({ stiffness: 100, damping: 16 }),
    delay: anime.stagger(70, { start: 250 }),
  });

  mm.querySelector('a').focus();
}

function closeMenu() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');

  // X → hamburger icon (delayed so circle starts closing first)
  anime.animate(hbSpans[0], {
    translateY: [6.5, 0],
    rotate: [45, 0],
    duration: 600,
    ease: anime.spring({ stiffness: 80, damping: 16 }),
    delay: 200,
  });
  anime.animate(hbSpans[1], {
    scaleX: [0, 1],
    duration: 400,
    ease: anime.spring({ stiffness: 80, damping: 16 }),
    delay: 300,
  });
  anime.animate(hbSpans[2], {
    translateY: [-6.5, 0],
    rotate: [-45, 0],
    duration: 600,
    ease: anime.spring({ stiffness: 80, damping: 16 }),
    delay: 200,
  });

  // Clear focus from menu links before closing
  document.activeElement?.blur();

  // Remove .open — CSS clip-path circle shrinks, hides everything
  mm.classList.remove('open');
  unlockScroll();

  // Reset link styles after clip-path transition ends so they're ready for next open
  closeTimer = setTimeout(() => {
    mmLinks.forEach(a => { a.style.transform = ''; a.style.opacity = ''; });
    closeTimer = null;
  }, 500);
}

hamburger.addEventListener('click', () => {
  if (mm.classList.contains('open')) { closeMenu(); } else { openMenu(); }
});
mmLinks.forEach(a => a.addEventListener('click', () => {
  if (!mm.classList.contains('open')) return;
  closeMenu();
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

      const cardIndex = card.style.getPropertyValue('--i').trim();

      if (cardIndex === '0') {
        // AI card — pulse neural circles, draw connection lines
        const circles = svg.querySelectorAll('circle');
        const lines = svg.querySelectorAll('line');
        // Store original opacities, then animate
        const circleOpacities = Array.from(circles).map(c => parseFloat(c.getAttribute('opacity')) || 0.5);
        circles.forEach(c => c.setAttribute('opacity', '0'));
        anime.animate(circles, {
          opacity: circleOpacities,
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
        const pathOpacities = Array.from(paths).map(p => parseFloat(p.getAttribute('opacity')) || 0.3);
        paths.forEach(p => p.setAttribute('opacity', '0'));
        anime.animate(paths, {
          opacity: pathOpacities,
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
        const dotOpacities = Array.from(dots).map(d => parseFloat(d.getAttribute('opacity')) || 0.3);
        dots.forEach(d => d.setAttribute('opacity', '0'));
        anime.animate(dots, {
          scale: [0, 1],
          opacity: dotOpacities,
          duration: 600,
          ease: anime.spring({ stiffness: 200, damping: 10 }),
          delay: anime.stagger(150, { start: 800 }),
        });
      }

      // Tags fade in
      const tags = card.querySelector('.invest-card-tags');
      if (tags) {
        anime.animate(tags, {
          opacity: [0, 1],
          duration: 600,
          ease: 'outExpo',
          delay: 600,
        });
      }

      cardObserver.unobserve(card);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.invest-card').forEach(card => cardObserver.observe(card));
}

// ── Quote — just reveal on scroll, no fancy animation ──
const quoteWrap = document.querySelector('.story-quote-wrap');
if (quoteWrap) {
  const quoteObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
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
        cards.forEach(c => {
          c.style.animation = 'none';
          c.style.opacity = '0';
          c.style.transform = 'translateY(16px)';
        });

        const cols = getComputedStyle(e.target).gridTemplateColumns.split(' ').length;
        const staggerOpts = cols > 1
          ? anime.stagger(60, { start: 100, grid: [cols, Math.ceil(cards.length / cols)], from: 'first' })
          : anime.stagger(50, { start: 100 });
        anime.animate(cards, {
          translateY: [16, 0],
          opacity: [0, 1],
          duration: 700,
          ease: anime.spring({ stiffness: 100, damping: 14 }),
          delay: staggerOpts,
        });

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
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }

      gridObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  gridObs.observe(aGrid);
}

// ── About section — story paragraphs stagger in from far ──
if (!prefersReducedMotion) {
  const storyText = document.querySelector('.story-text');
  if (storyText) {
    const storyPs = storyText.querySelectorAll('p');
    storyPs.forEach(p => {
      p.style.opacity = '0';
      p.style.transform = 'translateY(30px)';
    });
    const storyObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        storyPs.forEach((p, i) => {
          const delay = 100 + i * 200;
          anime.animate(p, {
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 1000,
            ease: anime.spring({ stiffness: 50, damping: 14 }),
            delay: delay,
          });
        });
        storyObs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    storyObs.observe(storyText);
  }
}


// ── About section — subsection labels slide in with underline draw ──
if (!prefersReducedMotion) {
  document.querySelectorAll('.subsection-label').forEach(label => {
    label.style.opacity = '0';
    label.style.transform = 'translateX(-16px)';
    const subObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        anime.animate(e.target, {
          translateX: [-16, 0],
          opacity: [0, 1],
          duration: 900,
          ease: anime.spring({ stiffness: 60, damping: 14 }),
          delay: 50,
        });
        subObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    subObs.observe(label);
  });
}

// ── Text effect 1: Section heading clip-path word reveal ──
if (!prefersReducedMotion) {
  document.querySelectorAll('.section-label').forEach(label => {
    const numSpan = label.querySelector('.section-num');
    // Extract the text after the section-num span
    const textNodes = [];
    label.childNodes.forEach(n => {
      if (n !== numSpan && n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
        textNodes.push(n);
      }
    });
    textNodes.forEach(node => {
      const words = node.textContent.trim().split(/\s+/);
      const frag = document.createDocumentFragment();
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'heading-word';
        span.textContent = word;
        span.style.transitionDelay = `${i * 120}ms`;
        frag.appendChild(span);
        if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      node.replaceWith(frag);
    });

    const headingWords = label.querySelectorAll('.heading-word');
    const hwObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        headingWords.forEach(w => w.classList.add('revealed'));
        hwObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    hwObs.observe(label);
  });
}

// ── Text effect 2: Color wipe on intro paragraphs ──
if (!prefersReducedMotion) {
  document.querySelectorAll('.who-intro').forEach(el => {
    el.classList.add('color-wipe');
    const cwObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('wiped');
        cwObs.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    cwObs.observe(el);
  });
}


// ── Text effect 4: Weight shift on story paragraphs ──
if (!prefersReducedMotion) {
  const storyParas = document.querySelectorAll('.story-text p');
  storyParas.forEach(p => p.classList.add('weight-shift'));
  const wsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      storyParas.forEach((p, i) => {
        setTimeout(() => p.classList.add('shifted'), i * 200);
      });
      wsObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  const storyText = document.querySelector('.story-text');
  if (storyText) wsObs.observe(storyText);
}

// ── Team accordion ──
function toggle(header) {
  const m = header.closest('.team-member');
  const wasOpen = m.classList.contains('open');
  // Close all other open members (instant, no animation)
  document.querySelectorAll('.team-member.open').forEach(o => {
    if (o === m) return;
    const body = o.querySelector('.team-body');
    body.style.transition = 'none';
    o.classList.remove('open');
    o.querySelector('.team-header').setAttribute('aria-expanded', 'false');
    getComputedStyle(body).gridTemplateRows;
    body.style.transition = '';
  });

  m.classList.toggle('open', !wasOpen);
  header.setAttribute('aria-expanded', String(!wasOpen));

  if (!prefersReducedMotion) {
    const toggle = m.querySelector('.team-toggle');
    if (!wasOpen) {
      // Opening — bounce the toggle, spring the bio in
      if (toggle) {
        anime.animate(toggle, {
          scale: [1, 1.2, 1],
          duration: 500,
          ease: anime.spring({ stiffness: 80, damping: 10 }),
        });
      }
    } else {
      // Closing — subtle settle
      if (toggle) {
        anime.animate(toggle, {
          scale: [1.1, 1],
          duration: 400,
          ease: anime.spring({ stiffness: 100, damping: 14 }),
        });
      }
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

// ── Scroll-linked: quote line grows with scroll progress ──
if (!prefersReducedMotion) {
  const quoteLine = document.querySelector('.quote-line');
  if (quoteLine) {
    anime.animate(quoteLine, {
      width: ['0px', '80px'],
      duration: 1000,
      ease: 'linear',
      autoplay: anime.onScroll({
        target: quoteLine,
        enter: 'bottom',
        leave: 'top',
      }),
    });
  }
}


// ── Footer entrance ──
if (!prefersReducedMotion) {
  const footer = document.querySelector('.footer');
  if (footer) {
    const footerLogo = footer.querySelector('.footer-logo');
    const footerPs = footer.querySelectorAll('.footer-grid p');
    const footerSocial = footer.querySelectorAll('.footer-social a');
    const footerCopy = footer.querySelector('.footer-copy');
    const footerDivider = footer.querySelector('.footer-grid');

    // Hide elements initially
    if (footerLogo) { footerLogo.style.opacity = '0'; footerLogo.style.transform = 'translateY(16px)'; }
    footerPs.forEach(p => { p.style.opacity = '0'; p.style.transform = 'translateY(12px)'; });
    footerSocial.forEach(a => { a.style.opacity = '0'; a.style.transform = 'translateY(10px)'; });
    if (footerCopy) { footerCopy.style.opacity = '0'; }

    const footerObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;

        // Logo springs in first
        if (footerLogo) {
          anime.animate(footerLogo, {
            translateY: [16, 0], opacity: [0, 1],
            duration: 800,
            ease: anime.spring({ stiffness: 60, damping: 14 }),
            delay: 100,
          });
        }

        // Info paragraphs stagger in
        anime.animate(footerPs, {
          translateY: [12, 0], opacity: [0, 1],
          duration: 700,
          ease: anime.spring({ stiffness: 60, damping: 14 }),
          delay: anime.stagger(100, { start: 250 }),
        });

        // Social icons stagger in
        anime.animate(footerSocial, {
          translateY: [10, 0], opacity: [0, 1],
          duration: 600,
          ease: anime.spring({ stiffness: 80, damping: 14 }),
          delay: anime.stagger(60, { start: 500 }),
        });

        // Copyright fades in last
        if (footerCopy) {
          anime.animate(footerCopy, {
            opacity: [0, 1],
            duration: 600,
            ease: 'outQuad',
            delay: 700,
          });
        }

        // Divider line draws (border-bottom on footer-grid)
        if (footerDivider) {
          footerDivider.style.borderBottomColor = 'transparent';
          anime.animate(footerDivider, {
            borderBottomColor: ['transparent', 'rgba(245,245,235,0.1)'],
            duration: 800,
            ease: 'outQuad',
            delay: 300,
          });
        }

        footerObs.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    footerObs.observe(footer);
  }
}

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
    closeMenu();
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
