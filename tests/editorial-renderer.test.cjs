const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { JSDOM } = require('jsdom');

test('section anchors handle repeated headings and ignore headings inside code blocks', () => {
  const root = path.resolve(__dirname, '..');
  const markdown = '## Check & approve\n\nText.\n\n```text\n## Not a section\n```\n\n## Check & approve\n\n### Check & approve\n\n## Café details\n\n## Check & approve-2\n';
  const result = JSON.parse(execFileSync('python3', ['-B', '-c', [
    'import importlib.util,json,sys',
    "spec=importlib.util.spec_from_file_location('renderer','tools/content-renderer.py')",
    'renderer=importlib.util.module_from_spec(spec)',
    'spec.loader.exec_module(renderer)',
    'text=sys.stdin.read()',
    "print(json.dumps({'html':renderer.render(text),'sections':renderer.section_headings(text)}))"
  ].join('\n')], { cwd: root, input: markdown, encoding: 'utf8' }));
  const doc = new JSDOM(result.html).window.document;
  const headings = [...doc.querySelectorAll('h2')];
  assert.equal(headings.length, 4);
  assert.deepEqual(headings.map(node => node.id), ['section-check-approve', 'section-check-approve-2', 'section-cafe-details', 'section-check-approve-2-2']);
  assert.equal(doc.querySelector('h3').id, 'section-check-approve-3');
  assert.deepEqual(result.sections, headings.map(node => ({ id: node.id, text: node.textContent })));
  assert.ok(doc.querySelector('pre code').textContent.includes('## Not a section'));
});

test('article headers choose one visible published, updated or draft date', () => {
  const root = path.resolve(__dirname, '..');
  const result = JSON.parse(execFileSync('python3', ['-B', '-c', [
    'import importlib.util,json',
    'def load(name,path):',
    ' spec=importlib.util.spec_from_file_location(name,path)',
    ' mod=importlib.util.module_from_spec(spec)',
    ' spec.loader.exec_module(mod)',
    ' return mod',
    "renderer=load('renderer','tools/content-renderer.py')",
    "layout=load('layout','tools/editorial-layout.py')",
    "image={'src':'/images/example.webp','width':1536,'height':1024,'role':'featured'}",
    "renderer.IMAGE_SIZES[image['src']]=(1536,1024)",
    "renderer.IMAGE_META[image['src']]=image",
    "article={'headline':'Example','section':'Process improvement','images':[image],'datePublished':'2026-10-16','dateModified':'2026-10-16'}",
    "author={'name':'Example Author','url':'/author/'}",
    "text='# Example\\n\\nBy Example Author\\n\\n![Example illustration](/images/example.webp)\\n\\n*Example caption.*\\n\\n## A section\\n\\nText.\\n'",
    'results=[layout.article_main(article,author,text,renderer)]',
    "article['dateModified']='2026-10-27'",
    'results.append(layout.article_main(article,author,text,renderer))',
    "results.append(layout.article_main(article,author,text,renderer,draft_date='2026-10-27'))",
    'print(json.dumps(results))'
  ].join('\n')], { cwd: root, encoding: 'utf8' }));
  result.forEach((markup, index) => {
    const doc = new JSDOM(markup).window.document;
    assert.equal(doc.querySelectorAll('.article-meta time').length, 1);
    assert.equal(doc.querySelector('.article-date dt').textContent, index === 0 ? 'Published' : 'Updated');
    assert.equal(doc.querySelector('.article-date time').dateTime, index === 0 ? '2026-10-16' : '2026-10-27');
    assert.ok(doc.querySelector('.article-hero-media img'));
    assert.equal(doc.querySelector('.article-hero-media figcaption'), null);
    assert.ok(!doc.querySelector('.article-body').textContent.includes('Example caption.'));
  });
});
