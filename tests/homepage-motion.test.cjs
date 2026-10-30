const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');

function harness({ reduced = false, stacked = false, hash = '' } = {}) {
  const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { runScripts: 'outside-only', url: `http://localhost/${hash}` });
  const { window } = dom;
  const calls = [];
  const positions = new Map();
  const frames = [];
  const preference = { matches: reduced, addEventListener: (_, fn) => { preference.change = fn; } };
  window.matchMedia = () => preference;
  window.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
  Object.defineProperty(window, 'innerHeight', { value: 1000 });
  window.document.querySelectorAll('main *').forEach(element => {
    positions.set(element, 3000);
    element.getBoundingClientRect = () => {
      const shift = Number(element.style.transform.match(/translateY\(([-.\d]+)px\)/)?.[1] || 0);
      return { top: positions.get(element) - window.scrollY + shift, bottom: positions.get(element) - window.scrollY + shift + 400 };
    };
  });
  window.Element.prototype.animate = function (keyframes, options) {
    const call = { element: this, keyframes, options, cancelled: false, listeners: {} };
    calls.push(call);
    return { cancel() { call.cancelled = true; }, addEventListener(name, fn) { call.listeners[name] = fn; } };
  };
  const cards = [...window.document.querySelectorAll('.service-card')];
  cards.forEach((card, index) => positions.set(card, 900 + (stacked ? index * 500 : 0)));
  window.eval(fs.readFileSync('assets/homepage-motion.js', 'utf8'));
  function flush() { while (frames.length) frames.shift()(0); }
  flush();
  return {
    dom, window, calls, cards, positions,
    scroll(y) { window.scrollY = y; window.dispatchEvent(new window.Event('scroll')); flush(); },
    reduce() { preference.matches = true; preference.change({ matches: true }); },
  };
}

test('service cards wait until 70% of viewport, then use the approved stronger stagger once', () => {
  const h = harness();
  assert.equal(h.calls.length, 0, 'No entrance should finish at the bottom edge');
  h.scroll(199);
  assert.equal(h.calls.length, 0);
  h.scroll(200);
  assert.deepEqual(h.calls.map(call => call.options.delay), [0, 200, 400]);
  assert.ok(h.calls.every(call => call.options.duration === 700));
  assert.equal(h.calls[0].keyframes[0].transform, 'translateY(32px)');
  h.scroll(0); h.scroll(250);
  assert.equal(h.calls.length, 3, 'Returning never replays a reveal');
  h.dom.window.close();
});

test('stacked service cards reveal individually without desktop delays', () => {
  const h = harness({ stacked: true });
  h.scroll(200);
  assert.equal(h.calls.length, 1);
  h.scroll(700);
  assert.equal(h.calls.length, 2);
  assert.deepEqual(h.calls.map(call => call.options.delay), [0, 0]);
  h.dom.window.close();
});

test('About reveal follows scrolling from 80% to 55% and never reverses', () => {
  const h = harness();
  const heading = h.window.document.querySelector('#about h2');
  h.positions.set(heading, 1000);
  h.scroll(200);
  assert.equal(heading.style.opacity, '0');
  h.scroll(325);
  assert.equal(Number(heading.style.opacity), 0.5);
  assert.equal(heading.style.transform, 'translateY(16px)');
  h.scroll(250);
  assert.equal(Number(heading.style.opacity), 0.5, 'Backtracking preserves revealed progress');
  h.scroll(450);
  assert.equal(heading.style.opacity, '');
  assert.equal(heading.style.transform, '');
  h.scroll(0);
  assert.equal(heading.style.opacity, '', 'Completed content stays readable');
  h.dom.window.close();
});

test('reduced motion uses opacity only without a stagger or scroll scrubbing', () => {
  const h = harness({ reduced: true });
  assert.ok(h.cards.every(card => card.style.transform === ''));
  h.scroll(200);
  assert.equal(h.calls.length, 3);
  for (const call of h.calls) {
    assert.equal(call.options.duration, 120);
    assert.equal(call.options.delay, 0);
    assert.ok(call.keyframes.every(frame => !('transform' in frame)));
  }
  h.dom.window.close();
});

test('focus, anchor destinations and reduced-motion changes expose pending content immediately', () => {
  const h = harness();
  h.cards[0].querySelector('a').focus();
  assert.equal(h.cards[0].style.opacity, '');
  h.window.document.querySelector('a[href="#services"]').dispatchEvent(new h.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  h.scroll(200);
  assert.equal(h.calls.length, 0, 'Anchor destinations bypass all pending entrances');
  h.positions.set(h.window.document.querySelector('#approach h2'), 900);
  h.scroll(300);
  assert.equal(h.calls.length, 1);
  h.reduce();
  assert.ok(h.calls[0].cancelled);
  assert.ok([...h.window.document.querySelectorAll('main [style]')].every(element => element.style.opacity !== '0'));
  h.dom.window.close();
});

test('initial hash navigation exposes its destination and static actions never get hidden', () => {
  const h = harness({ hash: '#services' });
  h.scroll(300);
  assert.equal(h.calls.length, 0);
  for (const selector of ['h1', '#contact-form', '.technology-grid', 'nav']) {
    assert.equal(h.window.document.querySelector(selector).style.opacity, '');
  }
  h.dom.window.close();
});

test('technology wave rises from below with left-to-right timing on both grid sizes', () => {
  for (const columns of [8, 4]) {
    const h = harness();
    const icons = [...h.window.document.querySelectorAll('.technology-item')];
    icons.forEach((icon, index) => h.positions.set(icon, 1000 + Math.floor(index / columns) * 120));
    h.scroll(249);
    assert.equal(h.calls.filter(call => icons.includes(call.element)).length, 0);
    h.scroll(250);
    let wave = h.calls.filter(call => icons.includes(call.element));
    assert.equal(wave.length, columns);
    assert.deepEqual(wave.map(call => call.options.delay), Array.from({ length: columns }, (_, i) => i * 90));
    assert.ok(wave.every(call => call.options.duration === 600));
    assert.ok(wave.every(call => call.keyframes[0].transform === 'translateY(24px)'));
    h.scroll(370);
    wave = h.calls.filter(call => icons.includes(call.element));
    assert.equal(wave.length, columns * 2);
    assert.equal(wave[columns].options.delay, 0, 'Each row begins a fresh wave');
    h.scroll(0); h.scroll(370);
    assert.equal(h.calls.filter(call => icons.includes(call.element)).length, columns * 2);
    h.dom.window.close();
  }
});

test('technology wave respects reduced motion and direct technology links', () => {
  for (const options of [{ reduced: true }, { hash: '#technology' }]) {
    const h = harness(options);
    const icons = [...h.window.document.querySelectorAll('.technology-item')];
    icons.forEach(icon => h.positions.set(icon, 1000));
    h.scroll(300);
    const wave = h.calls.filter(call => icons.includes(call.element));
    assert.equal(wave.length, options.reduced ? 16 : 0);
    assert.ok(icons.every(icon => icon.style.transform === ''));
    wave.forEach(call => {
      assert.equal(call.options.duration, 120);
      assert.equal(call.options.delay, 0);
      assert.ok(call.keyframes.every(frame => !('transform' in frame)));
    });
    h.dom.window.close();
  }
});
