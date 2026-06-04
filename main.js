/* ============================================================
   JUSTINE ROSE E. DOMINGGONO — Portfolio JavaScript
   ============================================================ */

'use strict';

/* ── 1. NAV: shrink on scroll + active link highlight ── */
(function initNav() {
  const nav       = document.querySelector('nav');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections  = document.querySelectorAll('section[id]');
  const scrollHint = document.querySelector('.scroll-hint');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });

    const btn = document.getElementById('back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);

    if (scrollHint) scrollHint.classList.toggle('hidden', window.scrollY > 80);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── 2. HAMBURGER MENU (mobile) ── */
(function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const drawer    = document.querySelector('.nav-drawer');
  if (!hamburger || !drawer) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    drawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close drawer when a link is clicked
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ── 3. FADE-IN ON SCROLL (Intersection Observer) ── */
(function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children inside a grid
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el, i) => {
    // Auto-stagger siblings inside the same parent grid
    if (!el.dataset.delay) {
      const siblings = Array.from(el.parentElement.children).filter(c =>
        c.classList.contains('fade-in')
      );
      el.dataset.delay = siblings.indexOf(el) * 100;
    }
    observer.observe(el);
  });
})();


/* ── 4. LANGUAGE BAR ANIMATION (removed — section replaced) ── */


/* ── 5. TYPED HERO TAGLINE ── */
(function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Frontend Developer',
    'UI / UX Designer',
    'Graphic Designer',
    'Creative Problem Solver',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;
  const SPEED_TYPE   = 80;
  const SPEED_DELETE = 45;
  const PAUSE_END    = 1800;
  const PAUSE_START  = 400;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }

    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }

  tick();
})();


/* ── 6. FLOATING PARTICLES (disabled on light theme) ── */
// Particles removed for clean white aesthetic


/* ── 7. CONTACT FORM VALIDATION ── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  function showError(input, msg) {
    input.classList.add('error');
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
  }

  function clearError(input) {
    input.classList.remove('error');
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) errEl.classList.remove('show');
  }

  function validate() {
    let valid = true;
    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');

    clearError(name); clearError(email); clearError(message);

    if (!name.value.trim()) {
      showError(name, 'Name is required.'); valid = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError(email, 'Email is required.'); valid = false;
    } else if (!emailRe.test(email.value.trim())) {
      showError(email, 'Please enter a valid email.'); valid = false;
    }

    if (!message.value.trim()) {
      showError(message, 'Message is required.'); valid = false;
    } else if (message.value.trim().length < 10) {
      showError(message, 'Message must be at least 10 characters.'); valid = false;
    }

    return valid;
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';

    const cfg = window._emailjsConfig;

    // If EmailJS is not configured yet, fall back to contact.php
    if (!cfg || cfg.serviceId === 'YOUR_SERVICE_ID') {
      try {
        const res = await fetch('contact.php', {
          method: 'POST',
          body: new FormData(form),
        });
        const data = await res.json();
        if (data.success) {
          status.innerHTML = `
            <span class="form-status-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span>Message sent — I'll get back to you soon.</span>`;
          status.className = 'form-status success';
          form.reset();
        } else {
          throw new Error(data.message || 'Server error.');
        }
      } catch (err) {
        status.innerHTML = `
          <span class="form-status-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
          <span>${err.message} Please email me directly.</span>`;
        status.className = 'form-status error';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
      return;
    }

    // EmailJS send
    try {
      await emailjs.send(cfg.serviceId, cfg.templateId, {
        from_name:    form.querySelector('#name').value.trim(),
        from_email:   form.querySelector('#email').value.trim(),
        subject:      form.querySelector('#subject')?.value.trim() || '(No subject)',
        message:      form.querySelector('#message').value.trim(),
      });
      status.innerHTML = `
        <span class="form-status-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <span>Message sent — I'll get back to you soon.</span>`;
      status.className = 'form-status success';
      form.reset();
    } catch (err) {
      status.innerHTML = `
        <span class="form-status-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </span>
        <span>Something went wrong. Please email me directly.</span>`;
      status.className = 'form-status error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
})();


/* ── 8. BACK TO TOP BUTTON ── */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ── 9. SLIDESHOW ── */
(function initSlideshow() {
  const track    = document.getElementById('slideshow-track');
  const thumbWrap = document.getElementById('slideshow-thumbs');
  const prevBtn  = document.getElementById('slide-prev');
  const nextBtn  = document.getElementById('slide-next');
  const currentEl = document.getElementById('slide-current');
  const totalEl   = document.getElementById('slide-total');
  if (!track) return;

  const slides = Array.from(track.children);
  const thumbs = thumbWrap ? Array.from(thumbWrap.querySelectorAll('.thumb')) : [];
  const total  = slides.length;
  let current  = 0;
  let autoTimer;

  if (totalEl) totalEl.textContent = total;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update counter
    if (currentEl) currentEl.textContent = current + 1;

    // Update thumbnails
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === current);
      if (i === current) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });

    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Thumbnail clicks
  thumbs.forEach(t => {
    t.addEventListener('click', () => goTo(parseInt(t.dataset.index)));
  });

  // Swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Pause on hover
  const slideshow = track.closest('.slideshow');
  if (slideshow) {
    slideshow.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slideshow.addEventListener('mouseleave', resetAuto);
  }

  resetAuto();
})();


/* ── 10. WEB PROJECT MINI SLIDESHOW ── */
(function initWebProjectSlideshow() {
  document.querySelectorAll('.web-project-imgs').forEach(container => {
    const slides = Array.from(container.querySelectorAll('.wp-slide'));
    const dots   = Array.from(container.querySelectorAll('.wp-dot'));
    const prev   = container.querySelector('.wp-arrow--prev');
    const next   = container.querySelector('.wp-arrow--next');
    if (!slides.length) return;

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
    }

    prev?.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    next?.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    dots.forEach((d, i) => d.addEventListener('click', e => { e.stopPropagation(); goTo(i); }));
  });
})();


/* ── 11. LIGHTBOX ── */
(function initLightbox() {
  const lightbox   = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn   = document.getElementById('lightbox-close');
  if (!lightbox) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Click on any wp-slide image
  document.querySelectorAll('.wp-slide').forEach(img => {
    img.addEventListener('click', e => {
      e.stopPropagation();
      open(img.src, img.alt);
    });
  });

  // Close on button, backdrop click, or Escape
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
