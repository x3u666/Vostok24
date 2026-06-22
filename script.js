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
const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
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

if (slides.length > 0) {
  startAutoSlide();

  if (sliderPrev) sliderPrev.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoSlide(); });
  if (sliderNext) sliderNext.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoSlide(); });

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
  row.classList.remove('food-row--hidden');
  row.classList.add('food-row--entering');
  row.querySelectorAll('.card-reveal').forEach(c => cardObserver.observe(c));
}

function hideRow(row) {
  row.classList.add('food-row--hidden');
  row.classList.remove('food-row--entering');
  row.querySelectorAll('.card-reveal').forEach(c => c.classList.remove('visible'));
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
  });
}

/* ── БАР и ЗАВТРАКИ ── */
setupToggle('barRow2',   'barBtn');
setupToggle('breakRow2', 'breakBtn');

function setupToggle(rowId, btnId) {
  const row = document.getElementById(rowId);
  const btn = document.getElementById(btnId);
  if (!row || !btn) return;
  let open = false;
  btn.addEventListener('click', () => {
    if (!open) {
      row.classList.remove('food-row--hidden');
      row.classList.add('food-row--entering');
      row.querySelectorAll('.card-reveal').forEach(c => cardObserver.observe(c));
      btn.textContent = 'Скрыть';
      open = true;
    } else {
      row.classList.add('food-row--hidden');
      row.classList.remove('food-row--entering');
      row.querySelectorAll('.card-reveal').forEach(c => c.classList.remove('visible'));
      btn.textContent = 'Ещё';
      open = false;
    }
  });
}

/* ── ГАЛЕРЕЯ ── */
const galRow2 = document.getElementById('galRow2');
const galBtn  = document.getElementById('galBtn');
let galOpen   = false;

if (galBtn) {
  galBtn.addEventListener('click', () => {
    if (!galOpen) {
      galRow2.classList.remove('gallery-row--hidden');
      galRow2.classList.add('gallery-row--entering');
      galBtn.textContent = 'Скрыть';
      galOpen = true;
    } else {
      galRow2.classList.add('gallery-row--hidden');
      galRow2.classList.remove('gallery-row--entering');
      galBtn.textContent = 'Ещё';
      galOpen = false;
    }
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
