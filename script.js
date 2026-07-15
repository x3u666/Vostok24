/* ============================================================
   ВОСТОК 24 — script.js
   ============================================================ */

const navbar       = document.getElementById('navbar');
const heroEl       = document.getElementById('hero');
const heroArrow    = document.getElementById('heroArrow');
const backToTop    = document.getElementById('backToTop');
const parallaxImg  = document.getElementById('heroParallaxImg');
const aboutSection = document.getElementById('about');

/* ── Navbar: появляется когда уходим с hero ── */
function updateNavbar() {
  const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
  navbar.classList.toggle('visible', heroBottom < 60);
}

/* ── Hero: затемнение при скролле + параллакс ── */
function updateHeroScroll() {
  const scrollY  = window.scrollY;
  const heroH    = heroEl ? heroEl.offsetHeight : window.innerHeight;
  const progress = Math.min(scrollY / heroH, 1);

  heroEl.classList.remove('scrolled-10','scrolled-25','scrolled-50','scrolled-75');
  if      (progress >= 0.75) heroEl.classList.add('scrolled-75');
  else if (progress >= 0.50) heroEl.classList.add('scrolled-50');
  else if (progress >= 0.25) heroEl.classList.add('scrolled-25');
  else if (progress >= 0.10) heroEl.classList.add('scrolled-10');

  if (parallaxImg) {
    parallaxImg.style.transform = `scale(1) translateY(${scrollY * 0.28}px)`;
  }

  backToTop.classList.toggle('visible', scrollY > heroH * 0.6);
}

window.addEventListener('scroll', () => {
  updateNavbar();
  updateHeroScroll();
}, { passive: true });

updateNavbar();
updateHeroScroll();

/* ── Стрелка на герое ── */
if (heroArrow) {
  heroArrow.addEventListener('click', () => {
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ── Лого → наверх ── */
const navLogo = document.getElementById('navLogo');
if (navLogo) {
  navLogo.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Кнопка Наверх ── */
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Активный пункт навбара ── */
const sectionIds = ['about','menu','bar','breakfast','gallery','contacts'];
const navLinks   = document.querySelectorAll('.navbar__links a[data-section]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === id));
    }
  });
}, { threshold: 0.25, rootMargin: '-10% 0px -60% 0px' });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ── Плавный скролл по ссылкам навбара ── */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Reveal: заголовки и slide-in ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-title, .slide-in').forEach(el => {
  revealObserver.observe(el);
});

/* ── Reveal: карточки с задержкой из CSS-переменной ── */
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.card-reveal').forEach(el => cardObserver.observe(el));

/* ── СЛАЙДЕР в разделе "О нас" ── */
const slides    = document.querySelectorAll('.slider__slide');
const dots      = document.querySelectorAll('.slider__dot');
const slider    = document.getElementById('aboutSlider');
let currentSlide = 0;
let sliderTimer  = null;

function goToSlide(idx) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (idx + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function startAutoSlide() {
  sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 4000);
}

function resetAutoSlide() {
  clearInterval(sliderTimer);
  startAutoSlide();
}

/* Drag / swipe — перелистывание зажатием ЛКМ или пальцем */
{
  let startX = 0, dragging = false;

  slider.addEventListener('pointerdown', e => {
    startX = e.clientX;
    dragging = true;
    slider.setPointerCapture(e.pointerId);
  });

  slider.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
      resetAutoSlide();
    }
  });

  slider.addEventListener('pointercancel', () => { dragging = false; });
}

if (slides.length > 0) {
  startAutoSlide();

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.idx));
      resetAutoSlide();
    });
  });
}

/* ── МЕНЮ: Ещё / Скрыть (3 ряда) ── */
const menuRow2 = document.getElementById('menuRow2');
const menuRow3 = document.getElementById('menuRow3');
const menuMore = document.getElementById('menuMore');
const menuHide = document.getElementById('menuHide');
let menuStage  = 0;

function showRow(row) {
  row.classList.remove('food-row--hidden', 'food-row--leaving');
  row.classList.add('food-row--entering');
  row.querySelectorAll('.card-reveal').forEach(c => cardObserver.observe(c));
}

function hideRow(row) {
  /* плавное исчезновение, затем скрытие из потока */
  row.classList.remove('food-row--entering');
  row.classList.add('food-row--leaving');
  setTimeout(() => {
    row.classList.add('food-row--hidden');
    row.classList.remove('food-row--leaving');
    row.querySelectorAll('.card-reveal').forEach(c => c.classList.remove('visible'));
  }, 600);
}

/* Прокрутить страницу так, чтобы переданный элемент оказался по центру viewport */
function scrollToCenter(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY
            - window.innerHeight / 2
            + el.offsetHeight / 2;
  window.scrollTo({ top, behavior: 'smooth' });
}

if (menuMore) {
  menuMore.addEventListener('click', () => {
    if (menuStage === 0) {
      showRow(menuRow2);
      menuStage = 1;
      menuHide.style.display = 'inline-flex';
    } else if (menuStage === 1) {
      showRow(menuRow3);
      menuStage = 2;
      menuMore.style.display = 'none';
    }
  });
}

if (menuHide) {
  menuHide.addEventListener('click', () => {
    hideRow(menuRow2);
    hideRow(menuRow3);
    menuStage = 0;
    menuMore.style.display = 'inline-flex';
    menuHide.style.display = 'none';
    /* прокрутка к первому ряду по центру — после fade-out */
    setTimeout(() => scrollToCenter(document.getElementById('menuRow1')), 600);
  });
}

/* ── БАР и ЗАВТРАКИ ── */
setupToggle('barRow2',   'barBtn',   'barRow1');
setupToggle('breakRow2', 'breakBtn', 'breakRow1');

function setupToggle(rowId, btnId, firstRowId) {
  const row = document.getElementById(rowId);
  const btn = document.getElementById(btnId);
  if (!row || !btn) return;
  let open = false;
  btn.addEventListener('click', () => {
    if (!open) {
      showRow(row);
      btn.textContent = 'Скрыть';
      open = true;
    } else {
      hideRow(row);
      btn.textContent = 'Ещё';
      open = false;
      setTimeout(() => scrollToCenter(document.getElementById(firstRowId)), 600);
    }
  });
}

/* ── ГАЛЕРЕЯ ── */
const galRows = [document.getElementById('galRow2'), document.getElementById('galRow3')];
const galBtn  = document.getElementById('galBtn');
const galHide = document.getElementById('galHide');
let galStep   = 0; /* 0 — только первый ряд, 1 — +второй, 2 — +третий */

function galRefresh() {
  /* «Скрыть» видна, когда раскрыт хотя бы один дополнительный ряд */
  if (galStep > 0) galHide.classList.remove('toggle-btn--hide');
  else             galHide.classList.add('toggle-btn--hide');
  /* «Ещё» прячется, когда все ряды раскрыты */
  if (galStep >= galRows.length) galBtn.classList.add('toggle-btn--hide');
  else                           galBtn.classList.remove('toggle-btn--hide');
}

if (galBtn) {
  galBtn.addEventListener('click', () => {
    if (galStep < galRows.length) {
      const row = galRows[galStep];
      row.classList.remove('gallery-row--hidden', 'gallery-row--leaving');
      row.classList.add('gallery-row--entering');
      galStep++;
      galRefresh();
    }
  });
}

if (galHide) {
  galHide.addEventListener('click', () => {
    /* плавное исчезновение, затем скрытие из потока */
    galRows.forEach(row => {
      row.classList.remove('gallery-row--entering');
      row.classList.add('gallery-row--leaving');
    });
    setTimeout(() => {
      galRows.forEach(row => {
        row.classList.add('gallery-row--hidden');
        row.classList.remove('gallery-row--leaving');
      });
      galStep = 0;
      galRefresh();
      scrollToCenter(document.getElementById('galRow1'));
    }, 300);
  });
}

/* ── LIGHTBOX ── */
const lightbox         = document.getElementById('lightbox');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

document.querySelectorAll('.food-card').forEach(card => {
  card.addEventListener('click', () => { if (card.dataset.zoom) openLightbox(card.dataset.zoom); });
});
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => { if (item.dataset.zoom) openLightbox(item.dataset.zoom); });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── Placeholder при ошибке загрузки фото ── */
document.querySelectorAll('.food-card__img-wrap img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    img.parentElement.classList.add('no-img');
  });
});
