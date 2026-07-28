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
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
    const title = aboutSection.querySelector('.section__title') || aboutSection;
    const top = title.getBoundingClientRect().top + window.scrollY - navH - 20;
    window.scrollTo({ top, behavior: 'smooth' });
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

function updateActiveNav() {
  const triggerLine = window.innerHeight * 0.33; /* контрольная точка — 1/3 от верха экрана */
  let currentId = sectionIds[0];
  let bestDelta = Infinity;

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    /* ищем секцию, чей верх прошёл контрольную точку и ближе всего к ней */
    const delta = triggerLine - top;
    if (delta >= -10 && delta < bestDelta) {
      bestDelta = delta;
      currentId = id;
    }
  });

  /* если прокрутили в самый верх — снимаем подсветку */
  if (window.scrollY < document.getElementById('about').offsetTop - 200) {
    navLinks.forEach(a => a.classList.remove('active'));
    return;
  }

  navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === currentId));
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('load', updateActiveNav);
updateActiveNav();

/* ── Плавный скролл по ссылкам навбара ── */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      /* скроллим к заголовку секции — так padding секции не влияет на позицию */
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 66;
      const title = target.querySelector('.section__title, .footer__title') || target;
      const top = title.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
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

/* ── БАР: Ещё / Скрыть (3 ряда) ── */
const barRow2 = document.getElementById('barRow2');
const barRow3 = document.getElementById('barRow3');
const barMore = document.getElementById('barMore');
const barHide = document.getElementById('barHide');
let barStage  = 0;

if (barMore) {
  barMore.addEventListener('click', () => {
    if (barStage === 0) {
      showRow(barRow2);
      barStage = 1;
      barHide.style.display = 'inline-flex';
    } else if (barStage === 1) {
      showRow(barRow3);
      barStage = 2;
      barMore.style.display = 'none';
    }
  });
}

if (barHide) {
  barHide.addEventListener('click', () => {
    hideRow(barRow2);
    hideRow(barRow3);
    barStage = 0;
    barMore.style.display = 'inline-flex';
    barHide.style.display = 'none';
    setTimeout(() => scrollToCenter(document.getElementById('barRow1')), 600);
  });
}

/* ── ЗАВТРАКИ ── */
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
const lightboxViewport = document.getElementById('lightboxViewport');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

/* ── Zoom / pan state ── */
const ZOOM_SCALE = 2.4;
const DRAG_THRESHOLD = 4;

let scale = 1;
let panX = 0, panY = 0;
let isPointerDown = false;
let dragMoved = false;
let startClientX = 0, startClientY = 0;
let startPanX = 0, startPanY = 0;

function setTransform(withTransition) {
  lightboxImg.style.transition = withTransition
    ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none';
  lightboxImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

function clampPan() {
  const baseW = lightboxImg.offsetWidth;
  const baseH = lightboxImg.offsetHeight;
  const vpRect = lightboxViewport.getBoundingClientRect();
  const maxPanX = Math.max(0, (baseW * scale - vpRect.width) / 2);
  const maxPanY = Math.max(0, (baseH * scale - vpRect.height) / 2);
  panX = Math.min(maxPanX, Math.max(-maxPanX, panX));
  panY = Math.min(maxPanY, Math.max(-maxPanY, panY));
}

function resetZoom() {
  scale = 1; panX = 0; panY = 0;
  lightboxViewport.classList.remove('zoomed');
  setTransform(false);
}

function zoomToPoint(clientX, clientY) {
  const rect = lightboxImg.getBoundingClientRect(); // rect at scale === 1
  const fracX = (clientX - rect.left) / rect.width  - 0.5;
  const fracY = (clientY - rect.top)  / rect.height - 0.5;
  scale = ZOOM_SCALE;
  panX = -fracX * rect.width  * ZOOM_SCALE;
  panY = -fracY * rect.height * ZOOM_SCALE;
  clampPan();
  lightboxViewport.classList.add('zoomed');
  setTransform(true);
}

function panToPoint(clientX, clientY) {
  if (scale === 1) return;
  const rect = lightboxViewport.getBoundingClientRect();
  const baseW = lightboxImg.offsetWidth;
  const baseH = lightboxImg.offsetHeight;
  const maxPanX = Math.max(0, (baseW * scale - rect.width) / 2);
  const maxPanY = Math.max(0, (baseH * scale - rect.height) / 2);
  const fracX = (clientX - rect.left) / rect.width - 0.5;
  const fracY = (clientY - rect.top)  / rect.height - 0.5;
  panX = -fracX * 2 * maxPanX;
  panY = -fracY * 2 * maxPanY;
  setTransform(false);
}

function openLightbox(src) {
  lightboxImg.src = src;
  resetZoom();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; resetZoom(); }, 300);
}

document.querySelectorAll('.food-card').forEach(card => {
  card.addEventListener('click', () => { if (card.dataset.zoom) openLightbox(card.dataset.zoom); });
});
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => { if (item.dataset.zoom) openLightbox(item.dataset.zoom); });
});

lightboxViewport.addEventListener('mousemove', e => {
  if (scale !== 1) panToPoint(e.clientX, e.clientY);
});

lightboxImg.addEventListener('click', e => {
  e.stopPropagation();
  if (scale === 1) {
    zoomToPoint(e.clientX, e.clientY);
  } else {
    resetZoom();
  }
});

lightboxImg.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  isPointerDown = scale !== 1;
  dragMoved = false;
  startClientX = t.clientX; startClientY = t.clientY;
  startPanX = panX; startPanY = panY;
}, { passive: true });

lightboxImg.addEventListener('touchmove', e => {
  if (!isPointerDown || e.touches.length !== 1) return;
  const t = e.touches[0];
  const dx = t.clientX - startClientX;
  const dy = t.clientY - startClientY;
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) dragMoved = true;
  panX = startPanX + dx;
  panY = startPanY + dy;
  clampPan();
  setTransform(false);
}, { passive: true });

lightboxImg.addEventListener('touchend', () => {
  isPointerDown = false;
  if (!dragMoved) {
    if (scale === 1) {
      zoomToPoint(startClientX, startClientY);
    } else {
      resetZoom();
    }
  }
  dragMoved = false;
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
