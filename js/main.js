/**
 * ==========================================================================
 * LORENZO AIROLDI | INTERACTIVE WEB RUNTIME & MICRO-INTERACTIONS
 * Modules: Particles, Spotlight, 3D Tilt, Bento Sandbox, Filtering, Multi-Step Form
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
  initTerminalSandbox();
  initBlogExperience();
  initInteractiveTimeline();
  initSkillsMatrix();
  initMultiStepForm();
  initClipboardButtons();
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
      // Trigger canvas theme update if active
      if (window.updateCanvasColors) window.updateCanvasColors();
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
    // Smooth lerp interpolation
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
  const cards = document.querySelectorAll('.spotlight-card, .article-card, .timeline-card');
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
    const maxTilt = 10; // degrees

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
  let mouse = { x: -1000, y: -1000, radius: 140 };

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

      // Mouse repulsion / attraction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 2.5;
        this.y -= (dy / dist) * force * 2.5;
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

  // Pause when off-screen to save performance
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

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * (isDark ? 0.25 : 0.12);
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
   7. Animated Stats Counters
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1600;
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
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
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
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

  // Sticky shadow on scroll
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
   10. Interactive Terminal Sandbox Tabs
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
      }
    });
  });
}

/* --------------------------------------------------------------------------
   11. Blog Filter, Live Search & Bookmark Engine
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
        showToast('Article removed from bookmarks');
      } else {
        savedBookmarks.push(id);
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
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category') || 'all';
      filterArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterArticles();
    });
  }

  // Quick Read Drawer Modal
  const quickReadButtons = document.querySelectorAll('.quick-read-trigger');
  const readingDrawer = document.querySelector('.reading-drawer');
  const drawerClose = document.querySelector('.drawer-close-btn');

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
        document.body.style.overflow = 'hidden';
      });
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        readingDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  }
}

/* --------------------------------------------------------------------------
   12. Interactive Timeline (About Me)
   -------------------------------------------------------------------------- */
function initInteractiveTimeline() {
  const nodes = document.querySelectorAll('.timeline-node');
  if (!nodes.length) return;

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const isAlreadyExpanded = node.classList.contains('expanded');
      // Toggle
      if (isAlreadyExpanded) {
        node.classList.remove('expanded');
      } else {
        nodes.forEach(n => n.classList.remove('expanded'));
        node.classList.add('expanded');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   13. Interactive Skills Matrix & Inspection Sandbox
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
    });
  });
}

/* --------------------------------------------------------------------------
   14. Dynamic Multi-Step Contact Form with Validation
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

  // Chip selection
  let selectedProjectType = 'Custom Project';
  projectChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      projectChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedProjectType = chip.getAttribute('data-value') || 'Custom Project';
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
  };

  nextBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Validation for Step 2
      if (currentStep === 2) {
        const nameInput = form.querySelector('#input-name');
        const emailInput = form.querySelector('#input-email');

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
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      goToStep(currentStep - 1);
    });
  });

  // Character counter for message
  const messageInput = form.querySelector('#input-message');
  const charCounter = form.querySelector('#message-char-counter');
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = `${messageInput.value.length} / 500`;
    });
  }

  // Submission
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
      }
      showToast('Message sent successfully! 🚀');
    }, 1100);
  });
}

/* --------------------------------------------------------------------------
   15. Direct Copy-to-Clipboard Buttons
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
   16. Global Toast Notification Utility
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
  }, 3500);
}
