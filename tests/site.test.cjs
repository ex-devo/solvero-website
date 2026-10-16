const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, '_content/blog/metadata.json'), 'utf8'));
const pages = ['index.html', 'services/workflow-automation/index.html', 'blog/index.html', ...articles.map(a => `blog/${a.slug}/index.html`), 'authors/jateen-narsai/index.html'];
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const urlFor = file => `https://solvero.co.za/${file.replace(/index\.html$/, '')}`;

for (const file of pages) {
  test(`${file}: search metadata and structured data describe the same page`, () => {
    const dom = new JSDOM(source(file), { url: urlFor(file) });
    const doc = dom.window.document;
    assert.equal(doc.querySelectorAll('h1').length, 1);
    assert.equal(doc.querySelectorAll('main').length, 1);
    assert.equal(doc.querySelector('link[rel="canonical"]').href, urlFor(file));
    assert.equal(doc.querySelector('meta[property="og:url"]').content, urlFor(file));
    assert.equal(doc.querySelector('meta[property="og:title"]').content, doc.title);
    const description = doc.querySelector('meta[name="description"]').content;
    assert.ok(description.length > 50);
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    const page = graph.find(item => ['WebPage', 'CollectionPage', 'ProfilePage'].includes(item['@type']));
    assert.equal(page.url, urlFor(file));
    assert.equal(page.name, doc.title);
    assert.equal(page.description, description);
    const ids = new Set(graph.map(item => item['@id']));
    function checkReferences(value) {
      if (!value || typeof value !== 'object') return;
      if (value['@id']) assert.ok(ids.has(value['@id']), `Missing entity ${value['@id']}`);
      for (const child of Object.values(value)) checkReferences(child);
    }
    checkReferences(graph);
    const organization = graph.find(item => item['@type'] === 'Organization');
    assert.equal(organization.email, 'solutions@solvero.co.za');
    assert.equal(organization.address.addressLocality, 'Johannesburg');
    assert.equal(organization.aggregateRating, undefined);
    assert.equal(organization.review, undefined);
    assert.equal(organization.priceRange, undefined);
    const robots = doc.querySelector('meta[name="robots"]');
    assert.ok(!robots || !robots.content.includes('noindex'));
    dom.window.close();
  });

  test(`${file}: local links and assets resolve, including fragment destinations`, () => {
    const dom = new JSDOM(source(file), { url: urlFor(file) });
    const doc = dom.window.document;
    for (const element of doc.querySelectorAll('[href], [src]')) {
      const url = new URL(element.getAttribute('href') || element.getAttribute('src'), urlFor(file));
      if (url.origin !== 'https://solvero.co.za') continue;
      let relative = decodeURIComponent(url.pathname).replace(/^\//, '');
      if (url.pathname.endsWith('/')) relative += 'index.html';
      assert.ok(fs.existsSync(path.join(root, relative)), `${file}: ${url}`);
      if (url.hash && relative.endsWith('.html')) {
        const target = new JSDOM(source(relative));
        assert.ok(target.window.document.getElementById(url.hash.slice(1)), `${file}: ${url.hash}`);
        target.window.close();
      }
    }
    assert.ok(doc.querySelector('a[href="mailto:solutions@solvero.co.za"]'));
    dom.window.close();
  });
}

test('sitemap covers indexable canonical pages and robots points to it', () => {
  const sitemap = new JSDOM(source('sitemap.xml'), { contentType: 'text/xml' });
  const indexablePages = pages.filter(file => {
    const dom = new JSDOM(source(file));
    const noindex = dom.window.document.querySelector('meta[name="robots"][content*="noindex"]');
    dom.window.close();
    return !noindex;
  });
  assert.deepEqual([...sitemap.window.document.querySelectorAll('loc')].map(item => item.textContent), indexablePages.map(urlFor));
  assert.match(source('robots.txt'), /Sitemap: https:\/\/solvero\.co\.za\/sitemap\.xml/);
  assert.doesNotMatch(source('robots.txt'), /Disallow:\s*\//);
  sitemap.window.close();
});

test('articles identify the visible author, publisher and actual publication date consistently', () => {
  const author = JSON.parse(source('_content/author.json'));
  const downloadNames = new Set();
  for (const article of articles) {
    const doc = new JSDOM(source(`blog/${article.slug}/index.html`)).window.document;
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    const post = graph.find(n => n['@type'] === 'BlogPosting');
    const person = graph.find(n => n['@type'] === 'Person');
    assert.equal(post.headline, doc.querySelector('h1').textContent);
    assert.equal(post.author['@id'], person['@id']);
    assert.equal(person.name, author.name);
    assert.equal(person.url, author.canonical);
    assert.deepEqual(person.sameAs, [author.linkedin]);
    assert.ok(doc.querySelector('.article-body').textContent.includes(person.description));
    assert.equal(doc.querySelector('[rel="author"]').getAttribute('href'), '/authors/jateen-narsai/');
    assert.equal(post.publisher['@id'], 'https://solvero.co.za/#organization');
    assert.notEqual(post.publisher['@id'], post.author['@id']);
    assert.equal(post.datePublished, doc.querySelector('time').dateTime);
    assert.ok(Date.parse(post.datePublished) <= Date.now());
    assert.ok(Date.parse(post.dateModified) >= Date.parse(post.datePublished));
    assert.doesNotMatch(doc.body.textContent, /Draft for review|publication not approved|Planned URL:/i);
    assert.doesNotMatch(doc.documentElement.innerHTML, /127\.0\.0\.1|localhost|\{\{/);
    const downloads = [...doc.querySelectorAll('a[href^="/blog/downloads/"]')];
    assert.equal(new Set(downloads.map(a => a.getAttribute('href'))).size, 2);
    downloads.forEach(a => downloadNames.add(a.getAttribute('href')));
  }
  assert.equal(downloadNames.size, 20);
  assert.equal(fs.readdirSync(path.join(root, 'blog/downloads')).length, 20);
  const bio = new JSDOM(source('authors/jateen-narsai/index.html')).window.document;
  const graph = JSON.parse(bio.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  assert.equal(graph.find(n => n['@type'] === 'ProfilePage').mainEntity['@id'], author.canonical + '#person');
  assert.ok(bio.querySelector('main').textContent.includes(author.biography));
  const index = new JSDOM(source('blog/index.html')).window.document;
  assert.equal(index.querySelectorAll('main article').length, 10);
  for (const article of articles) assert.ok(index.querySelector(`h3 a[href="/blog/${article.slug}/"]`));
});

function formHarness(fetch) {
  const dom = new JSDOM(source('index.html'), { url: urlFor('index.html'), runScripts: 'outside-only' });
  const { window } = dom;
  window.fetch = fetch;
  const script = [...window.document.scripts].find(item => item.textContent.includes('const contactForm'));
  window.eval(script.textContent);
  const form = window.document.querySelector('#contact-form');
  form.elements.name.value = 'Test enquiry';
  form.elements.email.value = 'test@example.com';
  form.elements.message.value = 'Reduce duplicate order entry.';
  return {
    dom, form,
    button: form.querySelector('[type="submit"]'),
    result: window.document.querySelector('#form-result'),
    submit: () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
  };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('successful enquiries send the form once and clear it only after acceptance', async () => {
  const calls = [];
  let accept;
  const harness = formHarness((url, options) => {
    calls.push({ url, options });
    return new Promise(resolve => { accept = resolve; });
  });
  harness.submit();
  harness.submit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.web3forms.com/submit');
  assert.equal(JSON.parse(calls[0].options.body).message, 'Reduce duplicate order entry.');
  assert.equal(harness.button.disabled, true);
  assert.equal(harness.form.elements.message.value, 'Reduce duplicate order entry.');
  accept({ ok: true, json: async () => ({ success: true }) });
  await settle();
  assert.equal(harness.form.elements.message.value, '');
  assert.equal(harness.button.disabled, false);
  assert.match(harness.result.textContent, /has been sent/);
  harness.dom.window.close();
});

for (const [failure, response] of [
  ['network failure', () => Promise.reject(new Error('offline'))],
  ['HTTP error', async () => ({ ok: false, json: async () => ({ success: true }) })],
  ['API rejection', async () => ({ ok: true, json: async () => ({ success: false }) })],
  ['malformed response', async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } })]
]) {
  test(`${failure} preserves the enquiry and allows a retry`, async () => {
    let calls = 0;
    const harness = formHarness(() => { calls++; return response(); });
    harness.submit();
    await settle();
    assert.equal(harness.form.elements.message.value, 'Reduce duplicate order entry.');
    assert.equal(harness.form.elements.email.value, 'test@example.com');
    assert.equal(harness.button.disabled, false);
    assert.match(harness.result.textContent, /could not be sent/);
    harness.submit();
    await settle();
    assert.equal(calls, 2);
    harness.dom.window.close();
  });
}

test('invalid enquiries do not reach the submission endpoint', async () => {
  let calls = 0;
  const harness = formHarness(async () => { calls++; });
  harness.form.elements.email.value = 'invalid';
  harness.submit();
  await settle();
  assert.equal(calls, 0);
  assert.equal(harness.button.disabled, false);
  harness.dom.window.close();
});
