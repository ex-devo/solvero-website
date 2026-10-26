const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, '_content/blog/metadata.json'), 'utf8'));
const offers = JSON.parse(fs.readFileSync(path.join(root, '_content/services.json'), 'utf8'));
const pages = ['index.html', ...offers.map(o => `services/${o.slug}/index.html`), 'blog/index.html', ...articles.map(a => `blog/${a.slug}/index.html`), 'authors/jateen-narsai/index.html'];
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const urlFor = file => `https://solvero.co.za/${file.replace(/index\.html$/, '')}`;
// Shared entities may be identified on another canonical page, such as the homepage catalogue.
const canonicalEntityIds = new Set();
for (const file of pages) {
  const dom = new JSDOM(source(file));
  const graph = JSON.parse(dom.window.document.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  for (const entity of graph) {
    if (entity['@type'] && entity['@id']) canonicalEntityIds.add(entity['@id']);
  }
  dom.window.close();
}

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
    function checkReferences(value) {
      if (!value || typeof value !== 'object') return;
      if (value['@id']) assert.ok(canonicalEntityIds.has(value['@id']), `Missing entity ${value['@id']}`);
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

test('core offers are discoverable from the homepage and relevant article conclusions', () => {
  const home = new JSDOM(source('index.html'));
  const offerSlugs = new Set(offers.map(offer => offer.slug));
  for (const offer of offers) {
    assert.ok(home.window.document.querySelector(`#services a[href="/services/${offer.slug}/"]`), offer.name);
    const page = new JSDOM(source(`services/${offer.slug}/index.html`));
    assert.ok(page.window.document.querySelector('#deliverables'));
    assert.ok(page.window.document.querySelector('#delivery'));
    assert.ok(page.window.document.querySelector('main a[href="/#contact"]'));
    page.window.close();
  }
  for (const article of articles) {
    assert.ok(offerSlugs.has(article.offer), `${article.slug}: a valid primary offer`);
    const page = new JSDOM(source(`blog/${article.slug}/index.html`));
    assert.ok(page.window.document.querySelector(`.article-body a[href="/services/${article.offer}/"]`), `${article.slug}: relevant offer link`);
    page.window.close();
  }
  home.window.close();
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
    const expectedDownloads = [...source(`_content/blog/${article.file}.md`).matchAll(/\]\(assets\/([^)]+)\)/g)].map(match => '/blog/downloads/' + match[1]);
    assert.deepEqual([...new Set(downloads.map(a => a.getAttribute('href')))].sort(), expectedDownloads.sort());
    downloads.forEach(a => downloadNames.add(a.getAttribute('href')));
  }
  assert.equal(downloadNames.size, 20);
  assert.equal(fs.readdirSync(path.join(root, 'blog/downloads')).length, 20);
  const bio = new JSDOM(source('authors/jateen-narsai/index.html')).window.document;
  const graph = JSON.parse(bio.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  assert.equal(graph.find(n => n['@type'] === 'ProfilePage').mainEntity['@id'], author.canonical + '#person');
  assert.ok(bio.querySelector('main').textContent.includes(author.biography));
  const index = new JSDOM(source('blog/index.html')).window.document;
  assert.equal(index.querySelectorAll('main article').length, articles.length);
  for (const article of articles) assert.ok(index.querySelector(`.blog-card-link[href="/blog/${article.slug}/"] h3`));
});

test('article pages retain the shared hero standard and original internal gaps', () => {
  const blogPages = articles.map(a => `blog/${a.slug}/index.html`);
  for (const file of blogPages) {
    const dom = new JSDOM(source(file));
    const hero = dom.window.document.querySelector('main header.editorial-hero');
    assert.ok(hero, `${file}: shared editorial hero`);
    assert.ok(hero.querySelector('[aria-label="Breadcrumb"]').classList.contains('mb-8'));
    assert.ok(hero.querySelector('h1').classList.contains('mb-6'));
    assert.doesNotMatch(hero.className, /py-14|py-20/);
    dom.window.close();
  }
});

test('the AI operating model article publishes all six illustrations and matching image metadata', () => {
  const article = articles.find(a => a.slug === 'ai-operating-model');
  assert.ok(article);
  const dom = new JSDOM(source(`blog/${article.slug}/index.html`));
  const doc = dom.window.document;
  const figures = [...doc.querySelectorAll('.article-body figure')];
  assert.equal(figures.length, 6);
  assert.deepEqual(figures.map(f => f.querySelector('img').getAttribute('src')), article.images.map(i => i.src));
  for (const [i, figure] of figures.entries()) {
    const image = figure.querySelector('img');
    assert.ok(image.alt.length > 30);
    assert.equal(image.width, article.images[i].width);
    assert.equal(image.height, article.images[i].height);
    assert.ok(figure.querySelector('figcaption').textContent.length > 20);
    assert.equal(figure.querySelector('a'), null);
  }
  assert.doesNotMatch(doc.querySelector('.article-body').textContent, /!\[|\*Improving|\*Investment/);
  const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
  assert.equal(graph.find(n => n['@type'] === 'BlogPosting').image.url, article.image);
  assert.equal(doc.querySelector('meta[property="og:image"]').content, article.image);
  assert.equal(doc.querySelector('meta[name="twitter:image"]').content, article.image);
  assert.equal(doc.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
  assert.ok(doc.querySelector('.article-body').textContent.includes('The following example is fictional.'));
  dom.window.close();
});

test('every article has topic illustrations with captions and matching social metadata', () => {
  for (const article of articles) {
    assert.equal(article.images.length, article.slug === 'ai-operating-model' ? 6 : 4, `${article.slug}: planned illustration count`);
    const dom = new JSDOM(source(`blog/${article.slug}/index.html`));
    const doc = dom.window.document;
    const figures = [...doc.querySelectorAll('.article-body figure')];
    assert.equal(figures.length, article.images.length, article.slug);
    assert.deepEqual(figures.map(f => f.querySelector('img').getAttribute('src')), article.images.map(i => i.src));
    for (const [i, figure] of figures.entries()) {
      const image = figure.querySelector('img');
      assert.ok(image.alt.length > 30);
      assert.ok(figure.querySelector('figcaption').textContent.length > 20);
      assert.equal(image.width, article.images[i].width);
      assert.equal(image.height, article.images[i].height);
      const featured = article.images[i].role === 'featured';
      assert.equal(image.getAttribute('loading'), featured ? 'eager' : 'lazy');
      if (featured) {
        assert.equal(i, 0, 'Featured illustration appears before section illustrations');
        assert.equal(image.getAttribute('fetchpriority'), 'high');
      }
      if (article.images[i].variants) {
        assert.ok(image.getAttribute('sizes'));
        for (const variant of article.images[i].variants) {
          assert.ok(image.getAttribute('srcset').includes(`${variant.src} ${variant.width}w`));
          assert.ok(fs.existsSync(path.join(root, variant.src)), variant.src);
          assert.ok(fs.statSync(path.join(root, variant.src)).size < 160000, 'Illustration stays within its compressed size budget');
        }
      }
    }
    const graph = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
    assert.equal(graph.find(n => n['@type'] === 'BlogPosting').image.url, article.image);
    assert.equal(doc.querySelector('meta[property="og:image"]').content, article.image);
    assert.equal(doc.querySelector('meta[name="twitter:image"]').content, article.image);
    assert.equal(doc.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
    dom.window.close();
  }
});

function formHarness(fetch) {
  const dom = new JSDOM(source('index.html'), { url: urlFor('index.html'), runScripts: 'outside-only' });
  const { window } = dom;
  window.fetch = fetch;
  const script = [...window.document.scripts].find(item => item.textContent.includes('const contactForm'));
  window.eval(script.textContent);
  const form = window.document.querySelector('#contact-form');
  const acceptedEvents = [];
  window.document.addEventListener('solvero:enquiry-accepted', event => acceptedEvents.push(event));
  form.elements.name.value = 'Test enquiry';
  form.elements.email.value = 'test@example.com';
  form.elements.enquiry_area.value = 'Workflow automation';
  form.elements.message.value = 'Reduce duplicate order entry.';
  return {
    dom, form, acceptedEvents,
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
  harness.form.elements.company.value = 'Example company';
  harness.submit();
  harness.submit();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.web3forms.com/submit');
  assert.equal(JSON.parse(calls[0].options.body).message, 'Reduce duplicate order entry.');
  assert.equal(JSON.parse(calls[0].options.body).company, 'Example company');
  assert.equal(JSON.parse(calls[0].options.body).enquiry_area, 'Workflow automation');
  assert.equal(harness.button.disabled, true);
  assert.equal(harness.form.elements.message.value, 'Reduce duplicate order entry.');
  accept({ ok: true, json: async () => ({ success: true }) });
  await settle();
  assert.equal(harness.form.elements.message.value, '');
  assert.equal(harness.form.elements.company.value, '');
  assert.equal(harness.form.elements.enquiry_area.value, '');
  assert.equal(harness.button.disabled, false);
  assert.match(harness.result.textContent, /has been sent/);
  assert.equal(harness.acceptedEvents.length, 1);
  harness.dom.window.close();
});

test('enquiries require a selected area and accept general enquiries without a company', async () => {
  const calls = [];
  const harness = formHarness(async (url, options) => {
    calls.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ success: true }) };
  });
  harness.form.elements.enquiry_area.value = '';
  harness.submit();
  await settle();
  assert.equal(calls.length, 0, 'A visitor must choose an enquiry area');
  harness.form.elements.enquiry_area.value = 'Other / General enquiries';
  harness.submit();
  await settle();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].company, '');
  assert.equal(calls[0].enquiry_area, 'Other / General enquiries');
  assert.equal(harness.acceptedEvents.length, 1);
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
    assert.equal(harness.acceptedEvents.length, 0);
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
  assert.equal(harness.acceptedEvents.length, 0);
  assert.equal(harness.button.disabled, false);
  harness.dom.window.close();
});
