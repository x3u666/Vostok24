document.addEventListener('DOMContentLoaded', () => {
  initToggleMore();
  initToolbarHighlight();
  initSmoothAnchors();
  initHeroAnimation();
});

/* ===================== ЕЩЕ / СКРЫТЬ ===================== */
/*
  Каждая кнопка .toggle-more имеет:
  - data-target: id грида, в котором лежат карточки
  - data-max-groups: сколько раз можно нажать "еще" (групп для раскрытия)
  Карточки, которые показываются по "еще", помечены классом
  *--hidden и атрибутом data-reveal-group="N" (номер группы, в каком порядке открывать).
  Состояние (открыто/закрыто) сохраняется в sessionStorage по ключу target-id,
  чтобы при возврате на страницу/переходе по якорю не сбрасывалось.
*/
function initToggleMore() {
  const buttons = document.querySelectorAll('.toggle-more');

  buttons.forEach((button) => {
    const targetId = button.dataset.target;
    const grid = document.getElementById(targetId);
    if (!grid) return;

    const maxGroups = parseInt(button.dataset.maxGroups, 10) || 0;
    if (maxGroups === 0) {
      // в этой секции нет скрытых карточек — кнопка не нужна
      button.style.display = 'none';
      return;
    }

    const storageKey = `toggle-state:${targetId}`;
    const savedState = sessionStorage.getItem(storageKey);
    let openedGroups = savedState ? parseInt(savedState, 10) : 0;

    // применяем сохранённое состояние без анимации при загрузке
    applyGroupsState(grid, openedGroups, false);
    updateButtonLabel(button, openedGroups, maxGroups);

    button.addEventListener('click', () => {
      if (openedGroups < maxGroups) {
        openedGroups += 1;
      } else {
        openedGroups = 0;
      }
      applyGroupsState(grid, openedGroups, true);
      updateButtonLabel(button, openedGroups, maxGroups);
      sessionStorage.setItem(storageKey, String(openedGroups));
    });
  });
}

function applyGroupsState(grid, openedGroups, animate) {
  const hiddenItems = grid.querySelectorAll('[data-reveal-group]');

  hiddenItems.forEach((item) => {
    const itemGroup = parseInt(item.dataset.revealGroup, 10);
    const shouldShow = itemGroup <= openedGroups;

    if (shouldShow) {
      item.classList.remove('dish-card--hidden', 'gallery-photo--hidden');
      if (animate) {
        item.classList.add('reveal-animate');
        // сбрасываем класс анимации после её завершения, чтобы можно было повторить
        item.addEventListener('animationend', () => {
          item.classList.remove('reveal-animate');
        }, { once: true });
      }
    } else {
      item.classList.remove('reveal-animate');
      // возвращаем правильный класс скрытия в зависимости от типа элемента
      if (item.classList.contains('gallery-photo')) {
        item.classList.add('gallery-photo--hidden');
      } else {
        item.classList.add('dish-card--hidden');
      }
    }
  });
}

function updateButtonLabel(button, openedGroups, maxGroups) {
  button.textContent = openedGroups >= maxGroups ? 'скрыть' : 'еще';
}

/* ===================== ПОДСВЕТКА АКТИВНОГО РАЗДЕЛА В ТУЛБАРЕ ===================== */
function initToolbarHighlight() {
  const links = document.querySelectorAll('.toolbar__link');
  if (!links.length) return;

  const sections = Array.from(links)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach((link) => {
          link.classList.toggle('toolbar__link--active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}

/* ===================== ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ===================== */
function initSmoothAnchors() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ===================== АНИМАЦИЯ HERO ПРИ ЗАГРУЗКЕ ===================== */
function initHeroAnimation() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // небольшая задержка, чтобы анимация точно сыграла после рендера
  requestAnimationFrame(() => {
    hero.classList.add('hero--animated');
  });
}
