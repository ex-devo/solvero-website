(() => {
  const filters = document.querySelector('[data-blog-filters]');
  if (!filters) return;
  const buttons = [...filters.querySelectorAll('[data-blog-filter]')];
  const cards = [...document.querySelectorAll('[data-blog-card]')];
  const status = document.querySelector('[data-blog-results]');

  function select(button) {
    const topic = button.dataset.topic;
    let count = 0;
    for (const card of cards) {
      const matches = topic === '' || card.dataset.topic === topic;
      card.hidden = !matches;
      if (matches) count++;
    }
    for (const option of buttons) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    status.textContent = `${count} ${count === 1 ? 'article' : 'articles'}${topic ? ` · ${topic}` : ''} · Newest first`;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => select(button));
  }
  filters.hidden = false;
})();
