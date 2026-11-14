/**
 * ==========================================================================
 * LORENZO AIROLDI | ENHANCED INTERACTIVE RUNTIME & MICRO-INTERACTIONS
 * Modules: Command Palette (Cmd+K), Canvas Particles, Canvas Confetti,
 *          Spotlight Tracking, 3D Tilt, Audio FX, Bento Sandbox, Live Filters,
 *          Reading Drawer Modal, Timeline Engine, Multi-Step Form
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initScrollProgress();
  initCursorSpotlight();
  initCardSpotlights();
  init3DTilt();
  initHeroCanvas();
  initAnimatedCounters();
  initLiveClock();
  initNavigationDock();
  initCommandPalette();
  initTerminalSandbox();
  initDeepWorkPlayer();
  initTechPillInspector();
  initBlogExperience();
  initInteractiveTimeline();
  initSkillsMatrix();
  initMultiStepForm();
  initClipboardButtons();
  initSoundEffects();
});

/* --------------------------------------------------------------------------
   1. Theme Engine (Zero-Flicker & Persistent)
   -------------------------------------------------------------------------- */
function initThemeEngine() {
  const toggles = document.querySelectorAll('.theme-toggle-dock, .theme-toggle-btn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('theme', target);
      playMicroSound(target === 'dark' ? 380 : 540);
      showToast(`Switched to ${target} mode`);
    });
  });
}

/* --------------------------------------------------------------------------
   2. Scroll Progress Bar
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal <= 0) return;
    const progress = (window.scrollY / scrollTotal) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* --------------------------------------------------------------------------
   3. Ambient Cursor Spotlight
   -------------------------------------------------------------------------- */
function initCursorSpotlight() {
  const spotlight = document.querySelector('.cursor-spotlight');
  if (!spotlight || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  const loop = () => {
    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;
    spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* --------------------------------------------------------------------------
   4. Card Spotlight Tracking (Dynamic CSS variables)
   -------------------------------------------------------------------------- */
function initCardSpotlights() {
  const cards = document.querySelectorAll('.spotlight-card, .article-card, .timeline-card, .channels-card, .multi-step-form-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   5. 3D Tilt Physics for Portrait & Interactive Cards
   -------------------------------------------------------------------------- */
function init3DTilt() {
  const tiltElements = document.querySelectorAll('.tilt-element, .portrait-frame');
  if (!tiltElements.length || window.matchMedia('(pointer: coarse)').matches) return;

  tiltElements.forEach(el => {
    const maxTilt = 8; // gentle smooth degrees

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* --------------------------------------------------------------------------
   6. Dynamic Interactive Particle Background (Hero)
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.querySelector('#hero-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let isVisible = true;
  let mouse = { x: -1000, y: -1000, radius: 150 };

  const resize = () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    createParticles();
  };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.size = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 3;
        this.y -= (dy / dist) * force * 3;
      }
    }

    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(99, 102, 241, ${this.baseAlpha})`
        : `rgba(79, 70, 229, ${this.baseAlpha * 0.6})`;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((width * height) / 14000);
    const particleCount = Math.min(Math.max(count, 35), 75);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  });
  observer.observe(canvas);

  function render() {
    if (isVisible) {
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const lineColor = isDark ? '99, 102, 241' : '79, 70, 229';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * (isDark ? 0.25 : 0.12);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* --------------------------------------------------------------------------
   7. Animated Stats Counters with Re-trigger on Click
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * target;

      el.textContent = currentVal.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    };
    requestAnimationFrame(animate);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => {
    observer.observe(c);
    // Click to re-spin metric
    c.parentElement.style.cursor = 'pointer';
    c.parentElement.addEventListener('click', () => {
      playMicroSound(620);
      runCounter(c);
    });
  });
}

/* --------------------------------------------------------------------------
   8. Live Time Clock (Milan / CET)
   -------------------------------------------------------------------------- */
function initLiveClock() {
  const clockElements = document.querySelectorAll('.live-time-display');
  if (!clockElements.length) return;

  const updateClock = () => {
    const options = {
      timeZone: 'Europe/Rome',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeString = new Intl.DateTimeFormat('en-US', options).format(new Date());
    clockElements.forEach(el => {
      el.textContent = `${timeString} • Milan, Italy`;
    });
  };

  updateClock();
  setInterval(updateClock, 1000);
}

/* --------------------------------------------------------------------------
   9. Navigation Dock & Mobile Drawer
   -------------------------------------------------------------------------- */
function initNavigationDock() {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger-dock');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-item');

  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  if (!drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    playMicroSound(440);
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* --------------------------------------------------------------------------
   10. Raycast/Vercel-style Interactive Command Palette (Cmd+K / Ctrl+K)
   -------------------------------------------------------------------------- */
function initCommandPalette() {
  // Create palette elements if not in DOM
  let palette = document.querySelector('.cmd-palette-overlay');
  if (!palette) {
    palette = document.createElement('div');
    palette.className = 'cmd-palette-overlay';
    palette.innerHTML = `
      <div class="cmd-palette-box">
        <div class="cmd-palette-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" class="cmd-palette-input" placeholder="Type a command or jump to page... (ESC to close)" autofocus>
          <span class="cmd-palette-badge">ESC</span>
        </div>
        <div class="cmd-palette-results">
          <div class="cmd-palette-group-title">NAVIGATION</div>
          <a href="index.html" class="cmd-palette-item" data-title="Home">
            <span>🏠 Home</span>
            <span class="cmd-palette-item-tag">Page</span>
          </a>
          <a href="blog.html" class="cmd-palette-item" data-title="Blog">
            <span>✍️ Blog & Editorial</span>
            <span class="cmd-palette-item-tag">Page</span>
          </a>
          <a href="about.html" class="cmd-palette-item" data-title="About Me">
            <span>👤 About Me & Timeline</span>
            <span class="cmd-palette-item-tag">Page</span>
          </a>
          <a href="contact.html" class="cmd-palette-item" data-title="Get in Touch">
            <span>📬 Get in Touch / Contact</span>
            <span class="cmd-palette-item-tag">Page</span>
          </a>
          <div class="cmd-palette-group-title">ACTIONS</div>
          <button type="button" class="cmd-palette-item" data-action="toggle-theme">
            <span>🌓 Toggle Dark / Light Theme</span>
            <span class="cmd-palette-item-tag">Action</span>
          </button>
          <button type="button" class="cmd-palette-item" data-action="copy-email">
            <span>📋 Copy Email Address</span>
            <span class="cmd-palette-item-tag">Action</span>
          </button>
          <button type="button" class="cmd-palette-item" data-action="toggle-sound">
            <span>🔊 Toggle UI Micro-Sounds</span>
            <span class="cmd-palette-item-tag">Setting</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(palette);
  }

  const input = palette.querySelector('.cmd-palette-input');
  const items = palette.querySelectorAll('.cmd-palette-item');

  const openPalette = () => {
    palette.classList.add('open');
    input.value = '';
    filterItems('');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
    playMicroSound(520);
  };

  const closePalette = () => {
    palette.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Keyboard trigger Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === 'Escape' && palette.classList.contains('open')) {
      closePalette();
    }
  });

  // Clicking backdrop
  palette.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
  });

  // Filter items
  function filterItems(query) {
    const q = query.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  input.addEventListener('input', (e) => {
    filterItems(e.target.value);
  });

  // Action handlers
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const action = item.getAttribute('data-action');
      if (action === 'toggle-theme') {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const target = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('theme', target);
        showToast(`Theme changed to ${target}`);
        closePalette();
      } else if (action === 'copy-email') {
        navigator.clipboard.writeText('contact@lorenzoairoldi.com');
        showToast('Email copied to clipboard!');
        closePalette();
      } else if (action === 'toggle-sound') {
        window.__soundEnabled = !window.__soundEnabled;
        showToast(`UI sounds ${window.__soundEnabled ? 'enabled 🔊' : 'muted 🔇'}`);
        closePalette();
      }
    });
  });

  // Attach trigger button if present in navigation dock
  const cmdTriggerBtns = document.querySelectorAll('.cmd-palette-trigger');
  cmdTriggerBtns.forEach(btn => btn.addEventListener('click', openPalette));
}

/* --------------------------------------------------------------------------
   11. Interactive Terminal Sandbox Tabs
   -------------------------------------------------------------------------- */
function initTerminalSandbox() {
  const tabButtons = document.querySelectorAll('.terminal-tab-btn');
  const bodyEl = document.querySelector('.terminal-body');
  if (!tabButtons.length || !bodyEl) return;

  const codeSnippets = {
    'profile.ts': `<span class="syntax-kw">const</span> <span class="syntax-fn">engineer</span> = {
  name: <span class="syntax-str">"Lorenzo Airoldi"</span>,
  focus: [<span class="syntax-str">"Full-Stack"</span>, <span class="syntax-str">"Systems"</span>, <span class="syntax-str">"UI/UX"</span>],
  status: <span class="syntax-str">"Building responsive modern interfaces"</span>,
  available: <span class="syntax-kw">true</span>
};`,
    'stats.json': `{
  <span class="syntax-fn">"projectsCompleted"</span>: <span class="syntax-num">24</span>,
  <span class="syntax-fn">"coreTech"</span>: [<span class="syntax-str">"TypeScript"</span>, <span class="syntax-str">"React"</span>, <span class="syntax-str">"Go"</span>, <span class="syntax-str">"Python"</span>],
  <span class="syntax-fn">"performanceScore"</span>: <span class="syntax-num">100</span>
}`,
    'output.log': `[INFO] Initialized particle physics engine.
[OK] Theme tokens hydrated in 2ms.
[READY] All systems functional.`
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filename = btn.getAttribute('data-file');
      if (codeSnippets[filename]) {
        bodyEl.innerHTML = codeSnippets[filename];
        playMicroSound(480);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   12. Deep Work Audio Visualizer Widget Toggle
   -------------------------------------------------------------------------- */
function initDeepWorkPlayer() {
  const playerCard = document.querySelector('.deep-work-card');
  if (!playerCard) return;

  let isPlaying = true;
  playerCard.style.cursor = 'pointer';

  playerCard.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const bars = playerCard.querySelectorAll('.eq-bar');
    const statusText = playerCard.querySelector('.deep-work-status');

    bars.forEach(bar => {
      bar.style.animationPlayState = isPlaying ? 'running' : 'paused';
    });

    if (statusText) {
      statusText.textContent = isPlaying ? 'Ambient Electronics' : 'Paused';
    }

    playMicroSound(isPlaying ? 580 : 320);
    showToast(isPlaying ? 'Resumed Deep Work Focus 🎧' : 'Paused Deep Work Focus ⏸️');
  });
}

/* --------------------------------------------------------------------------
   13. Interactive Tech Pill Inspector
   -------------------------------------------------------------------------- */
function initTechPillInspector() {
  const techTags = document.querySelectorAll('.tech-tag');
  if (!techTags.length) return;

  techTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      playMicroSound(500);
      const techName = tag.textContent.trim();
      showToast(`Selected tech: ${techName} — primary production stack ⚡`);
    });
  });
}

/* --------------------------------------------------------------------------
   14. Blog Filter, Live Search, Bookmarks & Quick Preview Drawer
   -------------------------------------------------------------------------- */
function initBlogExperience() {
  const categoryPills = document.querySelectorAll('.category-pill-btn');
  const searchInput = document.querySelector('#blog-search-input');
  const articleCards = document.querySelectorAll('.article-card');
  const emptyState = document.querySelector('#blog-empty-state');
  const bookmarkButtons = document.querySelectorAll('.bookmark-toggle-btn');
  const bookmarkCountEl = document.querySelector('#bookmark-count-badge');

  if (!articleCards.length) return;

  // Bookmarks persistence in localStorage
  let savedBookmarks = JSON.parse(localStorage.getItem('saved_bookmarks') || '[]');

  const updateBookmarkUI = () => {
    bookmarkButtons.forEach(btn => {
      const id = btn.getAttribute('data-article-id');
      if (savedBookmarks.includes(id)) {
        btn.classList.add('saved');
        btn.setAttribute('title', 'Remove bookmark');
      } else {
        btn.classList.remove('saved');
        btn.setAttribute('title', 'Save article');
      }
    });
    if (bookmarkCountEl) {
      bookmarkCountEl.textContent = savedBookmarks.length;
      bookmarkCountEl.style.display = savedBookmarks.length > 0 ? 'inline-block' : 'none';
    }
  };

  bookmarkButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-article-id');
      if (savedBookmarks.includes(id)) {
        savedBookmarks = savedBookmarks.filter(item => item !== id);
        playMicroSound(360);
        showToast('Article removed from bookmarks');
      } else {
        savedBookmarks.push(id);
        playMicroSound(640);
        showToast('Article saved to bookmarks! 🔖');
      }
      localStorage.setItem('saved_bookmarks', JSON.stringify(savedBookmarks));
      updateBookmarkUI();
      filterArticles();
    });
  });

  updateBookmarkUI();

  let activeCategory = 'all';
  let searchQuery = '';

  function filterArticles() {
    let visibleCount = 0;

    articleCards.forEach(card => {
      const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
      const cardId = card.getAttribute('data-article-id');
      const title = (card.querySelector('.article-title')?.textContent || '').toLowerCase();
      const excerpt = (card.querySelector('.article-excerpt')?.textContent || '').toLowerCase();

      let matchesCategory = false;
      if (activeCategory === 'all') {
        matchesCategory = true;
      } else if (activeCategory === 'saved') {
        matchesCategory = savedBookmarks.includes(cardId);
      } else {
        matchesCategory = cardCategory === activeCategory.toLowerCase();
      }

      const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        const titleEl = emptyState.querySelector('h3');
        const descEl = emptyState.querySelector('p');
        if (activeCategory === 'saved') {
          if (titleEl) titleEl.textContent = 'No bookmarks yet';
          if (descEl) descEl.textContent = 'Click the bookmark icon on any article card to save it for reading later!';
        } else {
          if (titleEl) titleEl.textContent = 'No matching articles found';
          if (descEl) descEl.textContent = 'Try adjusting your search terms or selecting a different category.';
        }
      } else {
        emptyState.style.display = 'none';
      }
    }
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      playMicroSound(450);
      filterArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterArticles();
    });
  }

  // Quick Read Drawer Modal with Backdrop & ESC Support
  const quickReadButtons = document.querySelectorAll('.quick-read-trigger');
  const readingDrawer = document.querySelector('.reading-drawer');
  const drawerClose = document.querySelector('.drawer-close-btn');

  // Create drawer backdrop if not in DOM
  let drawerBackdrop = document.querySelector('.reading-drawer-backdrop');
  if (!drawerBackdrop && readingDrawer) {
    drawerBackdrop = document.createElement('div');
    drawerBackdrop.className = 'reading-drawer-backdrop';
    document.body.appendChild(drawerBackdrop);
  }

  const closeReadingDrawer = () => {
    if (readingDrawer) readingDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (readingDrawer) {
    quickReadButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const title = btn.getAttribute('data-title') || 'Article Preview';
        const readTime = btn.getAttribute('data-time') || '5 min read';
        const drawerTitle = readingDrawer.querySelector('.drawer-title');
        const drawerMeta = readingDrawer.querySelector('.drawer-meta');

        if (drawerTitle) drawerTitle.textContent = title;
        if (drawerMeta) drawerMeta.textContent = readTime;

        readingDrawer.classList.add('open');
        if (drawerBackdrop) drawerBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        playMicroSound(500);
      });
    });

    if (drawerClose) drawerClose.addEventListener('click', closeReadingDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeReadingDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && readingDrawer.classList.contains('open')) {
        closeReadingDrawer();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   15. Interactive Timeline (About Me) with Expand/Collapse All
   -------------------------------------------------------------------------- */
function initInteractiveTimeline() {
  const nodes = document.querySelectorAll('.timeline-node');
  const toggleAllBtn = document.querySelector('#timeline-toggle-all-btn');
  if (!nodes.length) return;

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const isAlreadyExpanded = node.classList.contains('expanded');
      node.classList.toggle('expanded');
      playMicroSound(isAlreadyExpanded ? 380 : 520);
    });
  });

  if (toggleAllBtn) {
    let allExpanded = false;
    toggleAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      nodes.forEach(node => {
        if (allExpanded) node.classList.add('expanded');
        else node.classList.remove('expanded');
      });
      toggleAllBtn.textContent = allExpanded ? 'Collapse All' : 'Expand All';
      playMicroSound(allExpanded ? 560 : 400);
    });
  }
}

/* --------------------------------------------------------------------------
   16. Interactive Skills Matrix & Inspection Sandbox
   -------------------------------------------------------------------------- */
function initSkillsMatrix() {
  const tabs = document.querySelectorAll('.skill-tab-btn');
  const cards = document.querySelectorAll('.skill-interactive-card');
  const inspectorName = document.querySelector('#inspector-skill-name');
  const inspectorDesc = document.querySelector('#inspector-skill-desc');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-category');
      playMicroSound(460);

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.style.borderColor = '');
      card.style.borderColor = 'var(--accent-primary)';
      const name = card.getAttribute('data-name');
      const desc = card.getAttribute('data-desc');

      if (inspectorName) inspectorName.textContent = name;
      if (inspectorDesc) inspectorDesc.textContent = desc;
      playMicroSound(540);
    });
  });
}

/* --------------------------------------------------------------------------
   17. Dynamic Multi-Step Contact Form with Enter-Key Handling & Confetti
   -------------------------------------------------------------------------- */
function initMultiStepForm() {
  const form = document.querySelector('#interactive-contact-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 3;

  const panels = form.querySelectorAll('.form-step-panel');
  const circles = form.querySelectorAll('.step-circle');
  const progressBar = form.querySelector('.step-indicator-progress');
  const nextBtns = form.querySelectorAll('.form-next-step');
  const prevBtns = form.querySelectorAll('.form-prev-step');
  const projectChips = form.querySelectorAll('.project-chip-btn');
  const successCard = document.querySelector('#form-success-card');
  const nameInput = form.querySelector('#input-name');
  const emailInput = form.querySelector('#input-email');

  // Prevent premature Enter key submission on steps 1 and 2
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        validateAndProceed();
      } else {
        form.requestSubmit();
      }
    }
  });

  // Project chips selector
  projectChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      projectChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      playMicroSound(500);
    });
  });

  const goToStep = (step) => {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    panels.forEach(p => {
      p.classList.remove('active');
      if (parseInt(p.getAttribute('data-step'), 10) === currentStep) {
        p.classList.add('active');
      }
    });

    circles.forEach(c => {
      const cStep = parseInt(c.getAttribute('data-step'), 10);
      c.classList.remove('active', 'completed');
      if (cStep === currentStep) {
        c.classList.add('active');
      } else if (cStep < currentStep) {
        c.classList.add('completed');
      }
    });

    if (progressBar) {
      const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
      progressBar.style.width = `${pct}%`;
    }

    playMicroSound(480);
  };

  const validateAndProceed = () => {
    if (currentStep === 2) {
      if (!nameInput.value.trim()) {
        showToast('Please enter your name');
        nameInput.focus();
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showToast('Please enter a valid email address');
        emailInput.focus();
        return;
      }
    }
    goToStep(currentStep + 1);
  };

  nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    validateAndProceed();
  }));

  prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    goToStep(currentStep - 1);
  }));

  // Real-time email validation visual indicator
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(emailInput.value.trim())) {
        emailInput.style.borderColor = '#10B981';
      } else {
        emailInput.style.borderColor = '';
      }
    });
  }

  // Character counter for message
  const messageInput = form.querySelector('#input-message');
  const charCounter = form.querySelector('#message-char-counter');
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCounter.textContent = `${len} / 500`;
      if (len > 450) {
        charCounter.style.color = '#F59E0B';
      } else {
        charCounter.style.color = '';
      }
    });
  }

  // Submission with confetti celebration
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg style="animation: spin 1s linear infinite; width:17px; height:17px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      Sending message...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.style.display = 'none';
      if (successCard) {
        successCard.style.display = 'block';
        triggerConfettiCelebration();
      }
      playMicroSound(700);
      showToast('Message sent successfully! 🚀');
    }, 1000);
  });
}

/* --------------------------------------------------------------------------
   18. Canvas Confetti Particle Celebration
   -------------------------------------------------------------------------- */
function triggerConfettiCelebration() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const confettiCount = 120;
  const confetti = [];
  const colors = ['#6366F1', '#38BDF8', '#10B981', '#A855F7', '#F59E0B', '#F43F5E'];

  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    confetti.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rot += p.vRot;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }
  updateConfetti();
}

/* --------------------------------------------------------------------------
   19. Direct Copy-to-Clipboard Buttons
   -------------------------------------------------------------------------- */
function initClipboardButtons() {
  const copyButtons = document.querySelectorAll('.copy-trigger');
  if (!copyButtons.length) return;

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy') || '';
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = btn.innerHTML;
        playMicroSound(600);
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        showToast(`Copied "${textToCopy}" to clipboard!`);
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2200);
      } catch (err) {
        showToast('Failed to copy to clipboard');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   20. Web Audio API Synthesizer (Micro-Clicks & Haptics)
   -------------------------------------------------------------------------- */
let audioCtx = null;
window.__soundEnabled = true;

function initSoundEffects() {
  // Lazily init AudioContext on first user interaction to comply with browser policy
  const unlockAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

function playMicroSound(freq = 440) {
  if (!window.__soundEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Very soft volume and quick decay (18ms)
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (err) {
    // Silent fail if audio policy restricts
  }
}

/* --------------------------------------------------------------------------
   21. Global Toast Notification Utility
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-interactive');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-interactive';
    toast.innerHTML = `
      <span style="color:var(--accent-primary); display:flex; align-items:center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </span>
      <span class="toast-interactive-text" style="font-size:0.88rem; font-weight:600;"></span>
    `;
    document.body.appendChild(toast);
  }

  const textEl = toast.querySelector('.toast-interactive-text');
  if (textEl) textEl.textContent = message;

  toast.classList.add('show');
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
