const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const articles = JSON.parse(read('_content/blog/metadata.json'));
const offers = JSON.parse(read('_content/services.json'));
const pages = ['index.html', ...offers.map(offer => `services/${offer.slug}/index.html`), 'blog/index.html', ...articles.map(article => `blog/${article.slug}/index.html`), 'authors/jateen-narsai/index.html'];
const graph = doc => JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];

test('the publisher logo meets size guidance and follows the approved header artwork on every page', () => {
  const home = new JSDOM(read('index.html')).window.document;
  const organization = graph(home).find(node => node['@type'] === 'Organization');
  const logo = organization.logo;
  assert.ok(logo.width >= 112 && logo.height >= 112, 'Publisher logo must meet Google’s minimum dimensions');
  const exported = new JSDOM(read(new URL(logo.url).pathname), { contentType: 'image/svg+xml' }).window.document.documentElement;
  const header = new JSDOM(read('images/brand/rubix/solvero-header.svg'), { contentType: 'image/svg+xml' }).window.document.documentElement;
  assert.equal(Number(exported.getAttribute('width')), logo.width);
  assert.equal(Number(exported.getAttribute('height')), logo.height);
  assert.equal(exported.getAttribute('viewBox'), header.getAttribute('viewBox'));
  assert.equal(exported.innerHTML, header.innerHTML, 'Search logo keeps the exact approved shapes, colours and proportions');
  for (const file of pages) {
    const doc = new JSDOM(read(file)).window.document;
    assert.deepEqual(graph(doc).find(node => node['@type'] === 'Organization'), organization, file);
  }
});

test('article image schema describes the visible lead image without inventing a caption', async () => {
  for (const article of articles) {
    const doc = new JSDOM(read(`blog/${article.slug}/index.html`)).window.document;
    const post = graph(doc).find(node => node['@type'] === 'BlogPosting');
    const lead = doc.querySelector('.article-hero-media img');
    assert.equal(post.image.description, lead.alt, article.slug);
    assert.equal(post.image.caption, undefined, article.slug);
    assert.equal(doc.querySelector('.article-hero-media figcaption'), null);
    assert.equal(new URL(post.image.url).pathname, lead.getAttribute('src'));
    const image = await sharp(path.join(root, new URL(post.image.url).pathname)).metadata();
    assert.equal(post.image.width, image.width, article.slug);
    assert.equal(post.image.height, image.height, article.slug);
  }
});

test('article dates include a time zone while readers see one calendar date', () => {
  for (const article of articles) {
    const doc = new JSDOM(read(`blog/${article.slug}/index.html`)).window.document;
    const post = graph(doc).find(node => node['@type'] === 'BlogPosting');
    for (const property of ['datePublished', 'dateModified']) {
      assert.match(post[property], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+02:00$/, `${article.slug}: ${property}`);
      assert.equal(post[property], article[property]);
      const openGraph = property === 'datePublished' ? 'article:published_time' : 'article:modified_time';
      assert.equal(doc.querySelector(`meta[property="${openGraph}"]`).content, post[property]);
    }
    const visible = doc.querySelector('.article-meta time');
    assert.equal(doc.querySelectorAll('.article-meta time').length, 1);
    assert.equal(visible.textContent, new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(new Date(visible.dateTime)));
  }
});

test('structured breadcrumbs match visible trails and drafts remain outside the public graph', () => {
  for (const file of pages) {
    const doc = new JSDOM(read(file)).window.document;
    const nodes = graph(doc);
    const breadcrumb = nodes.find(node => node['@type'] === 'BreadcrumbList');
    const trail = doc.querySelector('nav[aria-label="Breadcrumb"]');
    assert.equal(Boolean(breadcrumb), Boolean(trail), file);
    if (trail) {
      assert.deepEqual(breadcrumb.itemListElement.map(item => item.name), [...trail.querySelectorAll('li')].map(item => item.textContent.replace(/^\/\s*/, '').trim()), file);
    }
    assert.ok(!JSON.stringify(nodes).includes('bank-zero'), 'Draft article is not part of the public graph');
  }
});
