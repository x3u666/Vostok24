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

/* ── Lightbox with book-style prev/next navigation ── */
const lightbox         = document.getElementById('lightbox');
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

function showAt(index) {
  if (!navImages.length) return;
  navIndex = (index + navImages.length) % navImages.length;
  lightboxImg.src = navImages[navIndex].src;
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
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

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
