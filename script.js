(function () {
  'use strict';

  // Shared state for easter egg access
  const neuralState = { particles: null, converging: false, W: 0, H: 0 };

  // ─── NEURAL NETWORK PARTICLE CANVAS ───
  function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles, mouse, animId;
    const PARTICLE_COUNT = 120;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;
    const MOUSE_FORCE = 0.08;

    mouse = { x: -1000, y: -1000 };

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(PARTICLE_COUNT, Math.floor((W * H) / 8000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 2 + 1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
      neuralState.particles = particles;
      neuralState.W = W;
      neuralState.H = H;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Convergence mode (easter egg)
        if (neuralState.converging) {
          const cx = W / 2;
          const cy = H / 2;
          const cdx = cx - p.x;
          const cdy = cy - p.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          const pullForce = 0.04 + (1 - Math.min(cdist / 400, 1)) * 0.06;
          p.vx += cdx * pullForce;
          p.vy += cdy * pullForce;
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else {
          // Mouse interaction
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // Friction
        p.vx *= neuralState.converging ? 0.92 : 0.98;
        p.vy *= neuralState.converging ? 0.92 : 0.98;

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Wrap edges
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < CONNECTION_DIST) {
            const alpha = (1 - cdist / CONNECTION_DIST) * 0.25;

            // Check if near mouse for brighter connections
            const midX = (p.x + p2.x) / 2;
            const midY = (p.y + p2.y) / 2;
            const mDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
            const brightness = mDist < MOUSE_RADIUS ? 0.6 : 0.15;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * (brightness / 0.15)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw particle with pulse
        const pulseR = p.r + Math.sin(p.pulse) * 0.5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * 3);
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.8)');
        gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.2)');
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(165, 180, 252, 0.9)';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
      createParticles();
      neuralState.W = W;
      neuralState.H = H;
    });

    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });
      hero.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }

    resize();
    createParticles();
    draw();
  }

  // ─── CUSTOM CURSOR ───
  function initCursor() {
    if (window.innerWidth <= 768) return;

    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let cx = 0, cy = 0;
    let fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
    });

    function followTick() {
      fx += (cx - fx) * 0.12;
      fy += (cy - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(followTick);
    }
    followTick();

    const hovers = document.querySelectorAll('a, button, .tilt-card, .tag, .btn, .exp__metric-card');
    hovers.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      });
    });
  }

  // ─── TYPING EFFECT ───
  const ROLES = ['Machine Learning Engineer', 'GenAI Builder', 'MLOps Architect'];
  const TYPE_SPEED = 70;
  const DELETE_SPEED = 35;
  const PAUSE_TYPED = 2200;
  const PAUSE_DELETED = 400;

  function initTyping() {
    const el = document.getElementById('typedTarget');
    if (!el) return;
    let roleIdx = 0, charIdx = 0, deleting = false;

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
        setTimeout(tick, TYPE_SPEED + Math.random() * 40);
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
    setTimeout(tick, 600);
  }

  // ─── SCROLL REVEAL ───
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
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ─── STAGGER DELAYS ───
  function initStagger() {
    const grids = document.querySelectorAll('.exp__grid, .projects__grid, .research__grid');
    grids.forEach((grid) => {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach((card, i) => { card.style.transitionDelay = `${i * 120}ms`; });
    });
  }

  // ─── NAVBAR ───
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

  // ─── MOBILE MENU ───
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
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

  // ─── 3D TILT CARDS ───
  function initTiltCards() {
    if (window.innerWidth <= 768) return;

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -6;
        const rotateY = (x - centerX) / centerX * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ─── MAGNETIC BUTTONS ───
  function initMagnetic() {
    if (window.innerWidth <= 768) return;

    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;

        const inner = btn.querySelector('.btn__text');
        if (inner) inner.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        const inner = btn.querySelector('.btn__text');
        if (inner) inner.style.transform = '';
      });
    });
  }

  // ─── COUNTER ANIMATION ───
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOutExpo(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }

    requestAnimationFrame(update);
  }

  // ─── EASTER EGG: type "gradient" anywhere ───
  function initEasterEgg() {
    const SECRET = 'gradient';
    let buffer = '';
    let active = false;

    const TRAINING_LOG = [
      { text: '$ python gradient_descent.py', cls: 'ee-green' },
      { text: '', cls: '' },
      { text: '>>> Initializing neural network...', cls: 'ee-dim' },
      { text: '>>> Loading weights from kartikeya/brain-v3.2', cls: 'ee-dim' },
      { text: '', cls: '' },
      { text: '<span class="ee-dim">[Epoch 1/100]</span> loss: <span class="ee-red">0.847</span> lr: 3e-4', cls: '' },
      { text: '<span class="ee-dim">[Epoch 12/100]</span> loss: <span class="ee-yellow">0.391</span> lr: 2.1e-4', cls: '' },
      { text: '<span class="ee-dim">[Epoch 47/100]</span> loss: <span class="ee-yellow">0.084</span> lr: 8e-5', cls: '' },
      { text: '<span class="ee-dim">[Epoch 89/100]</span> loss: <span class="ee-green">0.023</span> lr: 1e-5 <span class="ee-green">&#10003;</span>', cls: '' },
      { text: '', cls: '' },
      { text: '>>> Model converged. Evaluating metrics...', cls: 'ee-dim' },
      { text: '', cls: '' },
      { text: '<span class="ee-accent">[PrismV6]</span>     approval_rate  <span class="ee-green">+= 150bps</span>', cls: '' },
      { text: '<span class="ee-accent">[LLaMA-3]</span>     QLoRA fine-tune <span class="ee-green">complete</span>  TAT <span class="ee-green">-24h</span>', cls: '' },
      { text: '<span class="ee-accent">[Spade-RT]</span>    p99_latency    <span class="ee-green">&lt;25ms</span> @ 10K rps', cls: '' },
      { text: '<span class="ee-accent">[FeatureStore]</span> consistency    <span class="ee-green">99.99%</span>', cls: '' },
      { text: '<span class="ee-accent">[AWS]</span>          monthly_cost   <span class="ee-green">-$18,000</span>', cls: '' },
      { text: '', cls: '' },
      { text: '<span class="ee-white">>>> All metrics converged. Global minimum reached.</span>', cls: 'ee-line--result' },
      { text: '<span class="ee-dim">>>></span> <span class="ee-white">Kartikeya was here.</span> <span class="ee-cursor-blink">_</span>', cls: '' },
    ];

    function showOverlay() {
      const overlay = document.getElementById('eeOverlay');
      const body = document.getElementById('eeTerminalBody');
      if (!overlay || !body) return;

      active = true;
      body.innerHTML = '';
      overlay.classList.add('active');

      // Converge particles
      neuralState.converging = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Type out training log line by line
      TRAINING_LOG.forEach((line, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'ee-line' + (line.cls ? ' ' + line.cls : '');
          div.style.animationDelay = '0s';
          if (line.text === '') {
            div.innerHTML = '&nbsp;';
          } else {
            div.innerHTML = line.text;
          }
          body.appendChild(div);
          body.scrollTop = body.scrollHeight;
        }, 400 + i * 220);
      });

      // Auto-dismiss after log finishes
      const totalTime = 400 + TRAINING_LOG.length * 220 + 4000;
      setTimeout(() => dismiss(), totalTime);
    }

    function dismiss() {
      const overlay = document.getElementById('eeOverlay');
      if (overlay) overlay.classList.remove('active');

      neuralState.converging = false;

      // Explode particles outward with random angles and scatter to random positions
      if (neuralState.particles) {
        const W = neuralState.W;
        const H = neuralState.H;

        neuralState.particles.forEach((p) => {
          const angle = Math.random() * Math.PI * 2;
          const speed = 6 + Math.random() * 10;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        });

        // After the burst settles, scatter them to random positions like the initial state
        setTimeout(() => {
          neuralState.particles.forEach((p) => {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
            p.vx = (Math.random() - 0.5) * 0.6;
            p.vy = (Math.random() - 0.5) * 0.6;
          });
        }, 800);
      }

      setTimeout(() => { active = false; }, 1000);
    }

    // Desktop: type "gradient"
    document.addEventListener('keydown', (e) => {
      if (active) {
        if (e.key === 'Escape') dismiss();
        return;
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      buffer += e.key.toLowerCase();
      if (buffer.length > SECRET.length) {
        buffer = buffer.slice(-SECRET.length);
      }

      if (buffer === SECRET) {
        buffer = '';
        showOverlay();
      }
    });

    // Mobile: tap the KA logo 5 times rapidly
    const logo = document.querySelector('.nav__logo');
    if (logo) {
      const TAP_COUNT = 5;
      const TAP_WINDOW = 2000;
      let taps = [];

      logo.addEventListener('click', (e) => {
        if (active) return;

        const now = Date.now();
        taps.push(now);
        taps = taps.filter((t) => now - t < TAP_WINDOW);

        if (taps.length >= TAP_COUNT) {
          e.preventDefault();
          taps = [];
          showOverlay();
        }
      });
    }

    // Mobile: dismiss on overlay tap
    const overlayEl = document.getElementById('eeOverlay');
    if (overlayEl) {
      overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl && active) dismiss();
      });
    }
  }

  // ─── CONSOLE GREETING ───
  function initConsoleGreeting() {
    const style = 'color: #818cf8; font-size: 14px; font-weight: bold;';
    const styleDim = 'color: #71717a; font-size: 12px;';
    console.log('%cHey there, curious one. 👀', style);
    console.log('%cTry typing "gradient" anywhere on the page.', styleDim);
  }

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initCursor();
    initTyping();
    initReveal();
    initStagger();
    initNavbar();
    initMobileMenu();
    initTiltCards();
    initMagnetic();
    initCounters();
    initEasterEgg();
    initConsoleGreeting();
  });
})();
