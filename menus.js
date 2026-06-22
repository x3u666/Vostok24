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

/* ── Lightbox ── */
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

document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img && img.src) openLightbox(img.src);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
