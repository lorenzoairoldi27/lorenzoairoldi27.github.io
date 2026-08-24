/**
 * LORENZO AIROLDI | PERSONAL WEBSITE
 * Theme Switcher, Mobile Navigation, Blog Filtering & Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initBlogFilters();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. Theme Switcher (Dark & Light Mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  
  // Retrieve saved theme or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  });
}

/* --------------------------------------------------------------------------
   2. Sticky Header
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburgerBtns = document.querySelectorAll('.hamburger-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileBackdrop = document.querySelector('.mobile-backdrop');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.add('open');
    if (mobileBackdrop) mobileBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburgerBtns.forEach(btn => btn.addEventListener('click', openMenu));
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* --------------------------------------------------------------------------
   4. Scroll Reveal Animations
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('active'));
  }
}

/* --------------------------------------------------------------------------
   5. Blog Category Filtering & Live Search (Bug-Free)
   -------------------------------------------------------------------------- */
function initBlogFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#blog-search-input') || document.querySelector('#post-search-input');
  const blogCards = document.querySelectorAll('.blog-item, .post-item');
  const emptyState = document.querySelector('#blog-empty-state') || document.querySelector('#post-empty-state');

  if (!filterButtons.length && !searchInput) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterPosts() {
    let visibleCount = 0;

    blogCards.forEach(card => {
      const cardCategory = (card.getAttribute('data-category') || '').trim().toLowerCase();
      const titleElement = card.querySelector('.blog-title, .post-title');
      const excerptElement = card.querySelector('.blog-excerpt, .post-excerpt');

      const title = titleElement ? titleElement.textContent.toLowerCase() : '';
      const excerpt = excerptElement ? excerptElement.textContent.toLowerCase() : '';

      const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory.toLowerCase();
      const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = (btn.getAttribute('data-filter') || 'all').trim();
      filterPosts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterPosts();
    });
  }
}

/* --------------------------------------------------------------------------
   6. Contact Form Simulation
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Sending...
      `;
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      form.reset();
      showToast('Message sent! Thanks for reaching out — I will get back to you soon.');
    }, 900);
  });
}

/* --------------------------------------------------------------------------
   7. Toast Notification Utility
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div style="color:var(--accent-light); display:flex;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="toast-text" style="font-size: 0.9rem; font-weight: 500;"></div>
    `;
    document.body.appendChild(toast);
  }

  const toastText = toast.querySelector('.toast-text');
  if (toastText) toastText.textContent = message;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
