/* ============================================================
   ВОСТОК 24 — menus.js
   ============================================================ */

/* ── Tab switching via URL param ── */
const tabs     = document.querySelectorAll('.menus-tab');
const sections = document.querySelectorAll('.menus-section');

function activateTab(tabName) {
  const validTabs = ['main', 'bar', 'breakfast'];
  const name = validTabs.includes(tabName) ? tabName : 'main';

  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  sections.forEach(s => s.classList.toggle('active', s.id === `tab-${name}`));
}

// Read URL param on load
const params = new URLSearchParams(window.location.search);
activateTab(params.get('tab') || 'main');

// Tab click
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activateTab(tab.dataset.tab);
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab.dataset.tab);
    history.replaceState(null, '', url);
  });
});

/* ── Lightbox with book-style prev/next navigation + zoom/pan ── */
const lightbox         = document.getElementById('lightbox');
const lightboxViewport = document.getElementById('lightboxViewport');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxPrev     = document.getElementById('lightboxPrev');
const lightboxNext     = document.getElementById('lightboxNext');

let navImages = [];
let navIndex  = 0;

function updateNavButtons() {
  lightboxPrev.hidden = navImages.length < 2;
  lightboxNext.hidden = navImages.length < 2;
}

/* ── Zoom / pan state ── */
const ZOOM_SCALE = 2.4;
const DRAG_THRESHOLD = 4; // px of movement before a mousedown counts as a drag, not a click

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

function showAt(index) {
  if (!navImages.length) return;
  navIndex = (index + navImages.length) % navImages.length;
  lightboxImg.src = navImages[navIndex].src;
  resetZoom();
}

function openLightbox(sectionEl, clickedImg) {
  navImages = Array.from(
    sectionEl.querySelectorAll('.menu-cover img, .menu-spread__half img, .menu-single img')
  );
  navIndex = navImages.indexOf(clickedImg);
  if (navIndex === -1) navIndex = 0;
  updateNavButtons();
  showAt(navIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; resetZoom(); }, 300);
}

/* Mouse: once zoomed, the view pans just by moving the cursor (no click-drag needed) */
function panToPoint(clientX, clientY) {
  if (scale === 1) return;
  const rect = lightboxViewport.getBoundingClientRect();
  const baseW = lightboxImg.offsetWidth;
  const baseH = lightboxImg.offsetHeight;
  const maxPanX = Math.max(0, (baseW * scale - rect.width) / 2);
  const maxPanY = Math.max(0, (baseH * scale - rect.height) / 2);
  const fracX = (clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
  const fracY = (clientY - rect.top)  / rect.height - 0.5;
  panX = -fracX * 2 * maxPanX;
  panY = -fracY * 2 * maxPanY;
  setTransform(false);
}

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

/* Touch: tap to zoom toward the tap point, drag to pan while zoomed */
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

document.querySelectorAll('.menu-cover, .menu-spread__half, .menu-single').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const section = item.closest('.menus-section');
    if (img && img.src && section) openLightbox(section, img);
  });
});

lightboxPrev.addEventListener('click', e => { e.stopPropagation(); showAt(navIndex - 1); });
lightboxNext.addEventListener('click', e => { e.stopPropagation(); showAt(navIndex + 1); });
lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') showAt(navIndex + 1);
  if (e.key === 'ArrowLeft')  showAt(navIndex - 1);
});

/* ── Кнопка «Наверх» ── */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
