const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function harness() {
  const links = '<nav aria-label="On this page"><a href="#first">First</a><a href="#second">Second</a><a href="#last">Last</a></nav>';
  const dom = new JSDOM(`<article class="editorial-article">${links}<div class="article-body"><h2 id="first">First</h2><h2 id="second">Second</h2><h2 id="last">Last</h2></div>${links}</article>`, { runScripts: 'outside-only', url: 'https://solvero.co.za/blog/example/' });
  const positions = { first: 400, second: 900, last: 1500 };
  const frames = [];
  Object.defineProperty(dom.window.document.documentElement, 'scrollHeight', { value: 5000 });
  dom.window.requestAnimationFrame = callback => frames.push(callback);
  for (const heading of dom.window.document.querySelectorAll('h2')) heading.getBoundingClientRect = () => ({ top: positions[heading.id] });
  dom.window.eval(fs.readFileSync(path.resolve(__dirname, '../assets/article-navigation.js'), 'utf8'));
  return { dom, positions, flush() { while (frames.length) frames.shift()(0); } };
}

function currentSections(dom) {
  return [...dom.window.document.querySelectorAll('nav')].map(nav => [...nav.querySelectorAll('[aria-current="location"]')].map(link => link.hash));
}

test('the section highlight follows reading position in both directions without changing focus', () => {
  const { dom, positions, flush } = harness();
  assert.deepEqual(currentSections(dom), [[], []]);
  const focused = dom.window.document.querySelector('a[href="#last"]');
  focused.focus();
  positions.first = 24;
  dom.window.dispatchEvent(new dom.window.Event('scroll')); flush();
  assert.deepEqual(currentSections(dom), [['#first'], ['#first']]);
  positions.first = -600; positions.second = 24;
  dom.window.dispatchEvent(new dom.window.Event('scroll')); flush();
  assert.deepEqual(currentSections(dom), [['#second'], ['#second']]);
  focused.dispatchEvent(new dom.window.MouseEvent('mouseover', { bubbles: true }));
  assert.deepEqual(currentSections(dom), [['#second'], ['#second']], 'Hover does not replace the reading position');
  assert.equal(dom.window.document.activeElement, focused);
  positions.first = 24; positions.second = 800;
  dom.window.dispatchEvent(new dom.window.Event('scroll')); flush();
  assert.deepEqual(currentSections(dom), [['#first'], ['#first']]);
  dom.window.close();
});

test('hash navigation and resizing refresh the current section', () => {
  const { dom, positions, flush } = harness();
  positions.first = -1000; positions.second = -500; positions.last = 24;
  dom.window.dispatchEvent(new dom.window.HashChangeEvent('hashchange')); flush();
  assert.deepEqual(currentSections(dom), [['#last'], ['#last']]);
  positions.last = 500;
  dom.window.dispatchEvent(new dom.window.Event('resize')); flush();
  assert.deepEqual(currentSections(dom), [['#second'], ['#second']]);
  dom.window.close();
});

test('the final section is current at document end even when its heading cannot reach the reading line', () => {
  const { dom, positions, flush } = harness();
  positions.first = -1000; positions.second = -300; positions.last = 260;
  Object.defineProperty(dom.window, 'scrollY', { value: 5000 - dom.window.innerHeight });
  dom.window.dispatchEvent(new dom.window.Event('scroll')); flush();
  assert.deepEqual(currentSections(dom), [['#last'], ['#last']]);
  dom.window.close();
});
