const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const code = () => fs.readFileSync(path.join(root, 'assets/site-analytics.js'), 'utf8');
const consentKey = 'solvero.analytics-consent.v1';
const measurementId = 'G-TEST123456';
function harness({ host = 'solvero.co.za', choice, updatedAt = Date.now() } = {}) {
  const dom = new JSDOM(`<!doctype html><html><head><link rel="canonical" href="https://solvero.co.za/"><title>Solvero</title></head><body><main><a href="/#contact" id="contact">Discuss your goal</a><a href="/services/new-business-capabilities/" id="service">Explore</a><a href="mailto:solutions@solvero.co.za" id="email">Email</a></main><footer></footer></body></html>`, {
    url: `https://${host}/?email=private%40example.com&utm_source=linkedin&utm_medium=social&utm_campaign=website-launch#private`,
    referrer: 'https://example.org/private/person@example.com?token=private', runScripts: 'outside-only'
  });
  if (choice) dom.window.localStorage.setItem(consentKey, JSON.stringify({ version: 1, decision: choice, updatedAt }));
  const script = dom.window.document.createElement('script');
  script.dataset.measurementId = measurementId;
  Object.defineProperty(dom.window.document, 'currentScript', { value: script, configurable: true });
  const start = () => dom.window.eval(code());
  start();
  dom.window.document.addEventListener('click', event => event.preventDefault());
  const click = selector => dom.window.document.querySelector(selector).click();
  const events = name => (dom.window.dataLayer || []).map(args => [...args]).filter(args => args[0] === 'event' && (!name || args[1] === name));
  return { dom, window: dom.window, document: dom.window.document, click, events, start };
}

test('analytics sends nothing and loads no Google script before an explicit choice', () => {
  const h = harness();
  assert.ok(h.document.querySelector('[data-analytics-consent]'));
  assert.equal(h.document.querySelector('script[src*="googletagmanager"]'), null);
  assert.equal(h.window.dataLayer, undefined);
  assert.equal(h.window[`ga-disable-${measurementId}`], true);
  h.dom.window.close();
});

test('rejecting analytics saves the decision without loading Google or tracking enquiries', () => {
  const h = harness();
  h.click('[data-analytics-reject]');
  h.document.dispatchEvent(new h.window.Event('solvero:enquiry-accepted'));
  assert.equal(JSON.parse(h.window.localStorage.getItem(consentKey)).decision, 'denied');
  assert.equal(h.document.querySelector('script[src*="googletagmanager"]'), null);
  assert.equal(h.events().length, 0);
  assert.equal(h.document.querySelector('[data-analytics-consent]').hidden, true);
  h.dom.window.close();
});

test('granting consent loads one tag, keeps ads disabled and sanitises page and referral data', () => {
  const h = harness();
  h.click('[data-analytics-allow]');
  assert.equal(h.document.querySelectorAll('script[src*="googletagmanager"]').length, 1);
  const config = h.window.dataLayer.map(args => [...args]).find(args => args[0] === 'config');
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
  const page = h.events('page_view');
  assert.equal(page.length, 1);
  assert.equal(page[0][2].page_location, 'https://solvero.co.za/');
  assert.equal(page[0][2].page_referrer, 'https://example.org/');
  assert.equal(page[0][2].campaign_source, 'linkedin');
  assert.equal(page[0][2].campaign_medium, 'social');
  assert.ok(!JSON.stringify(h.window.dataLayer).includes('private'));
  h.dom.window.close();
});

test('saved consent starts tracking once and duplicate script initialisation cannot duplicate it', () => {
  const h = harness({ choice: 'granted' });
  h.start();
  assert.equal(h.events('page_view').length, 1);
  assert.equal(h.document.querySelectorAll('[data-analytics-preferences]').length, 1);
  assert.equal(h.document.querySelectorAll('script[src*="googletagmanager"]').length, 1);
  h.dom.window.close();
});

test('withdrawing consent stops events and deletes analytics cookies while preserving other cookies', () => {
  const h = harness({ choice: 'granted' });
  h.document.cookie = '_ga=analytics; path=/; domain=solvero.co.za';
  h.document.cookie = '_ga_TEST123456=analytics; path=/; domain=solvero.co.za';
  h.document.cookie = 'unrelated=keep; path=/';
  h.click('[data-analytics-preferences]');
  h.click('[data-analytics-reject]');
  const count = h.events().length;
  h.document.dispatchEvent(new h.window.Event('solvero:enquiry-accepted'));
  assert.equal(h.events().length, count);
  assert.equal(h.window[`ga-disable-${measurementId}`], true);
  assert.ok(!h.document.cookie.includes('_ga='));
  assert.ok(!h.document.cookie.includes('_ga_TEST123456='));
  assert.ok(h.document.cookie.includes('unrelated=keep'));
  assert.equal(h.document.activeElement, h.document.querySelector('[data-analytics-preferences]'));
  h.dom.window.close();
});

test('re-granting consent cannot duplicate the page view or tag', () => {
  const h = harness({ choice: 'granted' });
  h.click('[data-analytics-preferences]'); h.click('[data-analytics-reject]');
  h.click('[data-analytics-preferences]'); h.click('[data-analytics-allow]');
  assert.equal(h.events('page_view').length, 1);
  assert.equal(h.document.querySelectorAll('script[src*="googletagmanager"]').length, 1);
  h.document.dispatchEvent(new h.window.Event('solvero:enquiry-accepted'));
  assert.equal(h.events('generate_lead').length, 1);
  h.dom.window.close();
});

for (const host of ['localhost', '127.0.0.1', 'preview.example.com', 'solvero.co.za.evil.example']) {
  test(`${host} cannot load production analytics or present a consent banner`, () => {
    const h = harness({ host, choice: 'granted' });
    assert.equal(h.document.querySelector('[data-analytics-consent]'), null);
    assert.equal(h.window.dataLayer, undefined);
    h.dom.window.close();
  });
}

test('expired consent requires a new choice and an accepted enquiry never sends form contents', () => {
  const h = harness({ choice: 'granted', updatedAt: Date.now() - 181 * 86400000 });
  assert.equal(h.window.dataLayer, undefined);
  h.click('[data-analytics-allow]');
  h.document.dispatchEvent(new h.window.CustomEvent('solvero:enquiry-accepted', { detail: { email: 'private@example.com', message: 'private' } }));
  assert.deepEqual(JSON.parse(JSON.stringify(h.events('generate_lead')[0][2])), { form_name: 'contact', page_location: 'https://solvero.co.za/' });
  h.dom.window.close();
});

test('contact and service actions contain identifiers rather than full link URLs', () => {
  const h = harness({ choice: 'granted' });
  h.click('#contact'); h.click('#email'); h.click('#service');
  assert.equal(h.events('contact_click').length, 2);
  assert.equal(h.events('service_click')[0][2].service, 'new-business-capabilities');
  assert.ok(!JSON.stringify(h.window.dataLayer).includes('solutions@'));
  h.dom.window.close();
});

for (const decision of ['denied', 'removed', 'invalid']) {
  test(`consent ${decision} in another tab stops tracking in the current tab`, () => {
    const h = harness({ choice: 'granted' });
    if (decision === 'removed') h.window.localStorage.removeItem(consentKey);
    else if (decision === 'invalid') h.window.localStorage.setItem(consentKey, 'invalid');
    else h.window.localStorage.setItem(consentKey, JSON.stringify({ version: 1, decision, updatedAt: Date.now() }));
    h.window.dispatchEvent(new h.window.StorageEvent('storage', { key: consentKey }));
    const count = h.events().length;
    h.document.dispatchEvent(new h.window.Event('solvero:enquiry-accepted'));
    assert.equal(h.window[`ga-disable-${measurementId}`], true);
    assert.equal(h.events().length, count);
    h.dom.window.close();
  });
}

test('every canonical page has one correctly configured, versioned consent-gated analytics bundle', () => {
  const crypto = require('node:crypto');
  const id = JSON.parse(fs.readFileSync(path.join(root, '_content/tracking.json'))).ga4MeasurementId;
  assert.match(id, /^G-[A-Z0-9]{6,}$/);
  const sitemap = new JSDOM(fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
  const version = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12);
  for (const loc of sitemap.window.document.querySelectorAll('loc')) {
    const file = path.join(root, new URL(loc.textContent).pathname, 'index.html');
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    const scripts = dom.window.document.querySelectorAll('script[data-measurement-id]');
    assert.equal(scripts.length, 1, file);
    assert.equal(scripts[0].dataset.measurementId, id);
    assert.equal(scripts[0].getAttribute('src'), `/assets/site-analytics.js?v=${version('assets/site-analytics.js')}`);
    assert.equal(scripts[0].defer, true);
    assert.ok(dom.window.document.querySelector(`link[href="/styles/analytics.css?v=${version('styles/analytics.css')}"]`));
    assert.equal(dom.window.document.querySelector('script[src*="googletagmanager.com"]'), null);
    dom.window.close();
  }
  sitemap.window.close();
});
