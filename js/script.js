// Чекаємо, поки браузер повністю розбере HTML-документ, перш ніж шукати
// елементи та реєструвати обробники подій. Це не дає селекторам спрацювати
// раніше, ніж браузер створить елементи керування сторінки.
document.addEventListener('DOMContentLoaded', () => {
  // Зберігаємо посилання на елементи, які використовуються навігацією,
  // прокручуванням, анімаціями, lightbox галереї та контактною формою.
  // Це не дає повторювати однакові пошуки в DOM у різних частинах скрипту.
  const header = document.querySelector('.site-header');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const sections = [...document.querySelectorAll('main section[id]')];
  const backToTop = document.querySelector('.back-to-top');
  const revealItems = [...document.querySelectorAll('.reveal')];

  // Додаємо компактний стиль шапки після прокручування сторінки вниз.
  // Функція одразу викликається один раз, щоб після оновлення сторінка мала
  // правильний вигляд навіть тоді, коли браузер відновив позицію прокрутки.
  const setHeaderState = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  // Визначаємо секцію, яка зараз знаходиться біля верхньої позиції читання,
  // і відображаємо її в головній навігації. Поріг 160px залишає місце для
  // фіксованої шапки та забезпечує природну зміну активного пункту.
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

  // На вузьких екранах навігація ховається за кнопкою з трьома лініями.
  // aria-expanded оновлюється разом із CSS-класом, тому і звичайні користувачі,
  // і допоміжні технології отримують однаковий стан меню.
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('is-open');
  });

  // Замінюємо миттєвий перехід браузера за якорем на плавну прокрутку,
  // враховуючи висоту фіксованої шапки. Натискання посилання також закриває
  // мобільне меню.
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

  // Показуємо секції лише після появи у видимій області. Після показу секція
  // видаляється зі спостереження, оскільки їй більше не потрібно повторно
  // анімуватися під час наступного прокручування.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));

  // Показуємо кнопку повернення нагору після того, як користувач достатньо
  // прокрутив сторінку вниз і така кнопка стала корисною.
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

  // Галерея містить фотографії реалізацій. Кожна плитка зберігає велике
  // джерело в data-src для показу всередині спільного lightbox.
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-nav.prev');
  const nextBtn = document.querySelector('.lightbox-nav.next');
  const galleryTrigger = document.querySelector('.gallery-trigger');
  let currentIndex = 0;

  // Відкриваємо один елемент галереї та показуємо його фотографію в lightbox.
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

  // Ховаємо lightbox і ставимо відео на паузу, щоб звук або декодування не
  // продовжувалися після того, як діалог зник із екрана.
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  // Переміщуємося галереєю як циклічним списком. Додавання довжини списку
  // перед операцією залишку робить від'ємний індекс попереднього елемента
  // коректним.
  const updateLightbox = (direction) => {
    currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  };

  // Робимо кожну плитку галереї доступною для миші та клавіатури.
  // Enter і Space повторюють звичайну активацію кнопки для власних плиток.
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  galleryTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    openLightbox(0);
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => updateLightbox(-1));
  nextBtn?.addEventListener('click', () => updateLightbox(1));

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // Додаємо звичне керування lightbox з клавіатури: Escape закриває його,
  // а клавіші зі стрілками переміщують між сусідніми елементами галереї.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('visible')) {
      closeLightbox();
      return;
    }

    if (!lightbox?.classList.contains('visible')) return;

    if (event.key === 'ArrowRight') updateLightbox(1);
    if (event.key === 'ArrowLeft') updateLightbox(-1);
  });

  // Посилання на всі поля контакту зберігаємо в одному об'єкті, щоб однаково
  // виконувати перевірку під час введення та повторно під час надсилання.
  const contactForm = document.querySelector('.contact-form');
  const formFields = {
    name: document.querySelector('#name'),
    phone: document.querySelector('#phone'),
    message: document.querySelector('#message')
  };

  // Перевіряємо одне поле, оновлюємо повідомлення про помилку та повертаємо
  // інформацію про наявність корисного вмісту. Зараз форма перевіряє лише
  // обов'язковість полів; надсилання на сервер не входить до цієї демонстрації.
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

  // Перевіряємо поля під час введення, щоб помилки зникали одразу після
  // заповнення відсутнього значення.
  Object.values(formFields).forEach((field) => {
    field?.addEventListener('input', () => validateField(field));
  });

  // Сценарій надсилання є демонстрацією frontend-взаємодії: коректні дані
  // показують короткий стан завантаження та повідомлення про успіх, після чого
  // форма відновлюється для повторного використання. preventDefault не дає
  // статичній сторінці переходити на іншу адресу або перезавантажуватися.
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
