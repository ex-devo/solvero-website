(() => {
  'use strict';

  const article = document.querySelector('.editorial-article');
  if (!article) return;
  const headings = [...article.querySelectorAll('.article-body h2[id]')];
  const links = [...article.querySelectorAll('nav[aria-label="On this page"] a')];
  let scheduled = false;

  function updateCurrentSection() {
    let current = null;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > 96) break;
      current = heading.id;
    }
    const atDocumentEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atDocumentEnd && headings.length) current = headings[headings.length - 1].id;
    for (const link of links) {
      if (current !== null && link.getAttribute('href') === '#' + current) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      updateCurrentSection();
    });
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  updateCurrentSection();
})();
