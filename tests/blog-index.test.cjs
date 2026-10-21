const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, '_content/blog/metadata.json')));
const html = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
const search = fs.readFileSync(path.join(root, 'assets/blog-search.js'), 'utf8');
const cards = document => [...document.querySelectorAll('[data-blog-card]')];

function searchPage() {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://solvero.co.za/blog/' });
  dom.window.eval(search);
  return dom;
}
function enter(dom, value) {
  const input = dom.window.document.querySelector('input[type="search"]');
  input.value = value;
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  return cards(dom.window.document).filter(card => !card.hidden);
}

test('blog archive shows newest publications first in cards and structured data', () => {
  const dom = new JSDOM(html), document = dom.window.document;
  const visibleCards = cards(document);
  const dates = visibleCards.map(card => card.querySelector('time').dateTime);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.equal(dates[0], [...metadata.map(a => a.datePublished)].sort().at(-1));
  const listing = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].find(n => n['@type'] === 'ItemList');
  assert.deepEqual(listing.itemListElement.map(item => new URL(item.url).pathname), visibleCards.map(card => card.querySelector('h3 a').getAttribute('href')));
  assert.equal(visibleCards.length, metadata.length);
  dom.window.close();
});

test('every archive card uses its own article illustration with dimensions and descriptive alt text', () => {
  const dom = new JSDOM(html);
  for (const card of cards(dom.window.document)) {
    const article = metadata.find(a => card.querySelector('h3 a').getAttribute('href') === `/blog/${a.slug}/`);
    const image = card.querySelector('img');
    const registered = article.images.find(i => 'https://solvero.co.za' + i.src === article.image);
    assert.equal(article.thumbnail.source, registered.src);
    const allowed = article.thumbnail.variants.map(i => i.src);
    assert.ok(allowed.includes(image.getAttribute('src')));
    assert.ok(fs.existsSync(path.join(root, image.getAttribute('src'))));
    assert.equal(image.alt, article.image_alt);
    assert.equal(image.width, article.thumbnail.width);
    assert.equal(image.height, article.thumbnail.height);
    assert.ok(['eager', 'lazy'].includes(image.getAttribute('loading')));
  }
  assert.ok(cards(dom.window.document).every(card => !card.hidden), 'No-JavaScript visitors can browse every article');
  dom.window.close();
});

test('article search handles mixed case, punctuation, multiple terms and topic words', () => {
  const dom = searchPage();
  assert.equal(dom.window.document.querySelector('[data-blog-search]').hidden, false);
  assert.equal(enter(dom, '  N8N, power AUTOMATE  ').length, 1);
  assert.match(enter(dom, 'CRM accounting')[0].querySelector('h3').textContent, /duplicate data entry/i);
  const ai = enter(dom, 'AI');
  assert.ok(ai.length > 0);
  assert.ok(ai.every(card => /\bAI\b/i.test(card.dataset.searchText)), 'AI must not match unrelated word fragments');
  assert.ok(enter(dom, 'connected systems').length > 0, 'Topic names are searchable');
  assert.ok(enter(dom, 'automat').length > 1, 'Partial words find relevant titles and descriptions');
  dom.window.close();
});

test('no-results search gives feedback and clearing restores the original newest-first order', () => {
  const dom = searchPage(), document = dom.window.document;
  const before = cards(document).map(card => card.querySelector('h3').textContent);
  assert.equal(enter(dom, 'unfindablexyz').length, 0);
  assert.equal(document.querySelector('[data-blog-empty]').hidden, false);
  assert.equal(document.querySelector('[data-blog-results]').textContent, '0 articles found · Newest first');
  document.querySelector('[data-search-clear]').click();
  assert.equal(document.querySelector('[data-blog-empty]').hidden, true);
  assert.equal(document.querySelector('[data-search-clear]').hidden, true);
  assert.equal(document.activeElement, document.querySelector('input[type="search"]'));
  assert.deepEqual(cards(document).filter(card => !card.hidden).map(card => card.querySelector('h3').textContent), before);
  assert.equal(enter(dom, '   ').length, metadata.length);
  dom.window.close();
});
