const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const offers = JSON.parse(read('_content/services.json'));
const articles = JSON.parse(read('_content/blog/metadata.json'));
const offerPaths = ['/services/business-operations-improvement/', '/services/new-business-capabilities/', '/services/delivery-team-effectiveness/'];
const legacyRoutes = [
  ['/services/business-improvement-review/', offerPaths[0]],
  ['/services/process-workflow-improvement/', offerPaths[0]],
  ['/services/workflow-automation/', offerPaths[0]],
  ['/services/solution-design-delivery/', offerPaths[1]]
];
const retiredPaths = legacyRoutes.map(([from]) => from);
const doc = file => new JSDOM(read(file)).window.document;

test('each homepage service choice leads to one distinct canonical offer', () => {
  const document = doc('index.html');
  const section = document.querySelector('#services');
  const cards = [...section.querySelectorAll('.grid > div')];
  assert.equal(cards.length, 3, 'Show three main service choices');
  assert.deepEqual(cards.map(card => card.querySelector('h3').textContent.trim()), ['Improve how your business operates', 'Deliver new business capabilities', 'Improve delivery team effectiveness']);
  assert.deepEqual(cards.map(card => card.querySelector('a').getAttribute('href')), offerPaths);
  assert.deepEqual([...section.querySelectorAll('a[href^="/services/"]')].map(a => a.getAttribute('href')), offerPaths, 'Each need has one clear card link');
  for (const card of cards) assert.doesNotMatch(card.querySelector('a').textContent, /^Explore\b/);
  assert.equal(offers.length, 3);
  assert.deepEqual(offers.map(offer => `/services/${offer.slug}/`), offerPaths);
});

test('homepage catalogue describes the three linked service pages', () => {
  const document = doc('index.html');
  const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  const catalogue = graph.find(node => node['@type'] === 'OfferCatalog');
  assert.ok(catalogue, 'A homepage catalogue describes the actual service choices');
  const serviceIds = catalogue.itemListElement.map(offer => offer.itemOffered['@id']);
  assert.equal(serviceIds.length, 3);
  const services = serviceIds.map(id => graph.find(node => node['@id'] === id));
  assert.deepEqual(services.map(service => new URL(service.url).pathname), offerPaths);
  for (const service of services) {
    const page = doc(new URL(service.url).pathname.slice(1) + 'index.html');
    const schema = JSON.parse(page.querySelector('script[type="application/ld+json"]').textContent)['@graph'].find(node => node['@type'] === 'Service');
    assert.equal(schema.name, service.name);
    assert.equal(schema['@id'], service['@id']);
  }
});

test('legacy service URLs redirect directly to the appropriate current offer', () => {
  const sitemap = new JSDOM(read('sitemap.xml'), { contentType: 'text/xml' }).window.document;
  const urls = [...sitemap.querySelectorAll('loc')].map(item => item.textContent);
  assert.equal(urls.length, 17);
  assert.equal(new Set(urls).size, urls.length);
  for (const [from, to] of legacyRoutes) {
    const document = doc(from.slice(1) + 'index.html');
    const refresh = document.querySelector('meta[http-equiv="refresh"]');
    assert.ok(refresh, from + ': existing links have an immediate static redirect');
    assert.equal(refresh.content, `0; url=${to}`);
    assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://solvero.co.za' + to);
    assert.ok(document.querySelector(`a[href="${to}"]`), 'Destination is accessible without scripting');
    assert.equal(document.querySelector('script[type="application/ld+json"]'), null);
    const target = doc(to.slice(1) + 'index.html');
    assert.equal(target.querySelector('meta[http-equiv="refresh"]'), null, 'No redirect chains');
    assert.ok(!urls.some(url => new URL(url).pathname === from));
  }
});

test('internal navigation and article offers bypass the retired service', () => {
  const paths = ['index.html', ...offerPaths.map(route => route.slice(1) + 'index.html'), 'blog/index.html', ...articles.map(article => `blog/${article.slug}/index.html`), 'authors/jateen-narsai/index.html'];
  for (const file of paths) {
    const document = doc(file);
    const urls = [...document.querySelectorAll('a[href]')].map(a => new URL(a.getAttribute('href'), 'https://solvero.co.za/'));
    assert.ok(!urls.some(url => url.origin === 'https://solvero.co.za' && retiredPaths.includes(url.pathname)), `${file}: use the consolidated service directly`);
    const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    const values = [];
    function collect(value) {
      if (typeof value === 'string' && value.startsWith('https://solvero.co.za/')) values.push(new URL(value).pathname);
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    }
    collect(graph);
    assert.ok(!values.some(value => retiredPaths.includes(value)), `${file}: schema must not advertise the retired service`);
  }
  assert.ok(articles.every(article => offerPaths.includes(`/services/${article.offer}/`)));
});

test('each client need has a detailed page with examples, delivery scope and a route to contact', () => {
  for (const route of offerPaths) {
    const page = doc(route.slice(1) + 'index.html');
    for (const id of ['examples', 'deliverables', 'delivery', 'questions']) assert.ok(page.getElementById(id), `${route}: ${id}`);
    assert.equal(page.querySelectorAll('#examples article').length, 4);
    assert.equal(page.querySelectorAll('#deliverables .grid > article').length, 3);
    assert.ok(page.querySelector('main a[href="/#contact"]'));
    const related = [...page.querySelectorAll('main a[href^="/services/"]')].map(a => new URL(a.href, 'https://solvero.co.za').pathname);
    assert.deepEqual(new Set(related), new Set(offerPaths.filter(path => path !== route)));
  }
});
