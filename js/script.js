document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const sections = [...document.querySelectorAll('main section[id]')];
  const backToTop = document.querySelector('.back-to-top');
  const revealItems = [...document.querySelectorAll('.reveal')];

  const setHeaderState = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const setActiveNav = () => {
    let currentId = 'home';
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 160 && rect.bottom >= 160) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
    });
  };

  setActiveNav();
  window.addEventListener('scroll', setActiveNav, { passive: true });

  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('is-open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = 90;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });

      navToggle?.setAttribute('aria-expanded', 'false');
      mainNav?.classList.remove('is-open');
      navLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const updateBackToTop = () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-nav.prev');
  const nextBtn = document.querySelector('.lightbox-nav.next');
  let currentIndex = 0;

  const openLightbox = (index) => {
    if (!galleryItems.length || !lightbox || !lightboxImage) return;
    currentIndex = index;
    const item = galleryItems[currentIndex];
    if (!item) return;
    const src = item.dataset.src || item.querySelector('img')?.src;
    lightboxImage.src = src;
    lightboxImage.alt = item.querySelector('img')?.alt || 'Fotografia realizácie';
    lightbox.classList.add('visible');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  const updateLightbox = (direction) => {
    currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => updateLightbox(-1));
  nextBtn?.addEventListener('click', () => updateLightbox(1));

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('visible')) {
      closeLightbox();
      return;
    }

    if (!lightbox?.classList.contains('visible')) return;

    if (event.key === 'ArrowRight') updateLightbox(1);
    if (event.key === 'ArrowLeft') updateLightbox(-1);
  });

  const contactForm = document.querySelector('.contact-form');
  const formFields = {
    name: document.querySelector('#name'),
    phone: document.querySelector('#phone'),
    message: document.querySelector('#message')
  };

  const validateField = (field) => {
    const errorEl = field.closest('.field-group').querySelector('.form-error');
    const value = field.value.trim();
    const invalid = !value;

    field.classList.toggle('invalid', invalid);
    errorEl.classList.toggle('visible', invalid);
    if (invalid) {
      errorEl.textContent = 'Toto pole je povinné.';
    } else {
      errorEl.textContent = '';
    }

    return !invalid;
  };

  Object.values(formFields).forEach((field) => {
    field?.addEventListener('input', () => validateField(field));
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = Object.values(formFields);
    const valid = fields.every((field) => validateField(field));

    if (!valid) {
      contactForm.querySelector('.form-success').classList.remove('visible');
      return;
    }

    const submitButton = contactForm.querySelector('.btn-submit');
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.textContent = 'Odosielam...';

    setTimeout(() => {
      submitButton.textContent = 'Odoslané';
      contactForm.querySelector('.form-success').classList.add('visible');
      contactForm.reset();

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.textContent = 'Odoslať správu';
      }, 1000);
    }, 900);
  });
});
