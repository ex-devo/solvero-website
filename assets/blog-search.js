(() => {
  const form = document.querySelector('[data-blog-search]');
  if (!form) return;
  const input = form.querySelector('input');
  const clear = form.querySelector('[data-search-clear]');
  const status = document.querySelector('[data-blog-results]');
  const empty = document.querySelector('[data-blog-empty]');
  const normalise = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const cards = [...document.querySelectorAll('[data-blog-card]')].map(element => ({
    element,
    words: normalise(element.dataset.searchText).split(/\s+/)
  }));

  function filter() {
    const query = normalise(input.value);
    const terms = query ? query.split(/\s+/) : [];
    let count = 0;
    for (const card of cards) {
      const matches = terms.every(term => card.words.some(word => word.startsWith(term)));
      card.element.hidden = !matches;
      if (matches) count++;
    }
    clear.hidden = input.value.length === 0;
    empty.hidden = count !== 0;
    status.textContent = `${count} ${count === 1 ? 'article' : 'articles'}${terms.length ? ' found' : ''} · Newest first`;
  }

  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  input.addEventListener('input', filter);
  clear.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
  filter();
})();
