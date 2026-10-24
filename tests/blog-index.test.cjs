const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, '_content/blog/metadata.json')));
const html = fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8');
const cards = document => [...document.querySelectorAll('[data-blog-card]')];
const cardLink = card => card.querySelector('.blog-card-link');

function filterPage() {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://solvero.co.za/blog/' });
  dom.window.eval(fs.readFileSync(path.join(root, 'assets/blog-filters.js'), 'utf8'));
  return dom;
}
function selectTopic(dom, topic) {
  const button = [...dom.window.document.querySelectorAll('[data-blog-filter]')].find(b => b.dataset.topic === topic);
  assert.ok(button, `A visible topic control exists for ${topic || 'All'}`);
  button.focus();
  button.click();
  assert.equal(dom.window.document.activeElement, button, 'Filtering keeps focus on the selected control');
  return cards(dom.window.document).filter(card => !card.hidden);
}

test('blog archive shows newest publications first in cards and structured data', () => {
  const dom = new JSDOM(html), document = dom.window.document;
  const visibleCards = cards(document);
  const dates = visibleCards.map(card => card.querySelector('time').dateTime);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.equal(dates[0], [...metadata.map(a => a.datePublished)].sort().at(-1));
  const listing = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'].find(n => n['@type'] === 'ItemList');
  assert.deepEqual(listing.itemListElement.map(item => new URL(item.url).pathname), visibleCards.map(card => cardLink(card).getAttribute('href')));
  assert.equal(visibleCards.length, metadata.length);
  dom.window.close();
});

test('every archive card uses its own illustration and remains available without JavaScript', () => {
  const dom = new JSDOM(html);
  for (const card of cards(dom.window.document)) {
    const article = metadata.find(a => cardLink(card).getAttribute('href') === `/blog/${a.slug}/`);
    const image = card.querySelector('img');
    const registered = article.images.find(i => 'https://solvero.co.za' + i.src === article.image);
    assert.equal(article.thumbnail.source, registered.src);
    assert.ok(article.thumbnail.variants.some(i => i.src === image.getAttribute('src')));
    assert.ok(fs.existsSync(path.join(root, image.getAttribute('src'))));
    assert.equal(image.alt, article.image_alt);
    assert.equal(image.width, article.thumbnail.width);
    assert.equal(image.height, article.thumbnail.height);
    assert.ok(['eager', 'lazy'].includes(image.getAttribute('loading')));
    assert.equal(card.hidden, false);
  }
  assert.equal(dom.window.document.querySelector('[data-blog-filters]').hidden, true, 'Inactive controls are hidden without JavaScript');
  dom.window.close();
});

test('a single named link covers each entire card without nested interactive controls', () => {
  const dom = new JSDOM(html), document = dom.window.document;
  for (const card of cards(document)) {
    assert.equal(card.querySelectorAll('a').length, 1);
    const link = cardLink(card);
    assert.equal(link.parentElement, card);
    for (const selector of ['img', 'h3', '.blog-card-description', 'time', '.blog-card-read-more']) assert.ok(link.querySelector(selector), selector);
    assert.equal(document.getElementById(link.getAttribute('aria-labelledby')), link.querySelector('h3'));
    assert.equal(link.querySelectorAll('a,button,input').length, 0);
    assert.match(link.querySelector('.blog-card-read-more').textContent, /Read more/);
    assert.equal(link.querySelector('.blog-card-arrow').getAttribute('aria-hidden'), 'true');
  }
  dom.window.close();
});

test('topic filters select exact groups, announce counts and expose one selected state', () => {
  const dom = filterPage(), document = dom.window.document;
  assert.equal(document.querySelector('input[type="search"]'), null);
  assert.equal(document.querySelector('[data-blog-filters]').hidden, false);
  const topics = [...new Set(metadata.map(a => a.section))];
  assert.deepEqual([...document.querySelectorAll('[data-blog-filter]')].map(b => b.dataset.topic), ['', ...topics]);
  for (const topic of topics) {
    const visible = selectTopic(dom, topic);
    const expected = metadata.filter(a => a.section === topic);
    assert.equal(visible.length, expected.length);
    assert.ok(visible.every(card => card.dataset.topic === topic));
    assert.match(document.querySelector('[data-blog-results]').textContent, new RegExp(`^${expected.length} articles?`));
    assert.ok(document.querySelector('[data-blog-results]').textContent.includes(topic));
    const selected = [...document.querySelectorAll('[data-blog-filter][aria-pressed="true"]')];
    assert.equal(selected.length, 1);
    assert.equal(selected[0].dataset.topic, topic);
  }
  dom.window.close();
});

test('All restores every article in its original newest-first order after repeated filter changes', () => {
  const dom = filterPage(), document = dom.window.document;
  const original = cards(document).map(card => cardLink(card).getAttribute('href'));
  selectTopic(dom, 'Connected systems');
  selectTopic(dom, 'Workflow automation');
  selectTopic(dom, 'Process improvement');
  const restored = selectTopic(dom, '');
  assert.deepEqual(restored.map(card => cardLink(card).getAttribute('href')), original);
  assert.equal(document.querySelector('[data-blog-results]').textContent, `${metadata.length} articles · Newest first`);
  assert.equal(selectTopic(dom, '').length, metadata.length);
  dom.window.close();
});
