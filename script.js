(function () {
  'use strict';

  // ── Typing Effect ──
  const ROLES = [
    'Machine Learning Engineer',
    'GenAI Builder',
    'MLOps Architect',
  ];
  const TYPE_SPEED   = 80;
  const DELETE_SPEED  = 40;
  const PAUSE_TYPED   = 2000;
  const PAUSE_DELETED = 500;

  function initTyping() {
    const el = document.getElementById('typedTarget');
    if (!el) return;

    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function tick() {
      const current = ROLES[roleIdx];
      if (!deleting) {
        charIdx++;
        el.textContent = current.substring(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, PAUSE_TYPED);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx--;
        el.textContent = current.substring(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % ROLES.length;
          setTimeout(tick, PAUSE_DELETED);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }
    setTimeout(tick, 800);
  }

  // ── Scroll Reveal ──
  function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ── Navbar Scroll State ──
  function initNavbar() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--solid', window.scrollY > 50);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile Menu Toggle ──
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }

  // ── Hero Glow Follow Cursor ──
  function initHeroGlow() {
    const glow = document.getElementById('heroGlow');
    const hero = document.querySelector('.hero');
    if (!glow || !hero) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - 300;
      const y = e.clientY - rect.top - 300;
      glow.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // ── Stagger Reveal Delays ──
  function initStagger() {
    const grids = document.querySelectorAll(
      '.exp__grid, .projects__grid, .research__grid'
    );
    grids.forEach((grid) => {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 100}ms`;
      });
    });
  }

  // ── Init ──
  document.addEventListener('DOMContentLoaded', () => {
    initTyping();
    initReveal();
    initNavbar();
    initMobileMenu();
    initHeroGlow();
    initStagger();
  });
})();
