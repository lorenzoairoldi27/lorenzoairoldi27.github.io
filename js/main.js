/**
 * LORENZO AIROLDI | MODERN REAL ESTATE CONSULTING
 * Master JavaScript - Interactions, Filtering & Micro-animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initBlogFilters();
  initContactForm();
  initFaqAccordion();
  initNewsletterForm();
});

/* --------------------------------------------------------------------------
   1. Sticky Header & Scroll Effects
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
   2. Mobile Drawer Navigation
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileBackdrop = document.querySelector('.mobile-backdrop');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!mobileToggle || !mobileMenu) return;

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

  mobileToggle.addEventListener('click', openMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* --------------------------------------------------------------------------
   3. Scroll Reveal Animations (IntersectionObserver)
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    reveals.forEach(el => el.classList.add('active'));
  }
}

/* --------------------------------------------------------------------------
   4. Blog Category Filtering & Live Search
   -------------------------------------------------------------------------- */
function initBlogFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#blog-search-input');
  const articleCards = document.querySelectorAll('.blog-article-item');
  const emptyState = document.querySelector('#blog-empty-state');

  if (!filterButtons.length && !searchInput) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterArticles() {
    let visibleCount = 0;

    articleCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const title = (card.querySelector('.insight-title')?.textContent || '').toLowerCase();
      const excerpt = (card.querySelector('.insight-excerpt')?.textContent || '').toLowerCase();

      const matchesCategory = currentCategory === 'all' || cardCategory.toLowerCase() === currentCategory.toLowerCase();
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
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterArticles();
    });
  }
}

/* --------------------------------------------------------------------------
   5. Interactive Contact Form Submission & Toast
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#consultation-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Send Inquiry';

    // Disable button & show spinner
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Sending Request...
      `;
    }

    // Simulate asynchronous server dispatch
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      form.reset();
      showToast('Thank you! Your consultation request has been received. Lorenzo will reach out within 24 hours.');
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   6. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items for clean single-expanded experience
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Newsletter Subscription Simulation
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        input.value = '';
        showToast('Subscribed to Market Insights Quarterly! Check your inbox for the latest briefing.');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Global Toast Notification Utility
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-icon">
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
  }, 4500);
}

