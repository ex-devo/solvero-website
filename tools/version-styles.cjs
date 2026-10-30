const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const version = createHash('sha256')
  .update(fs.readFileSync(path.join(root, 'assets/tailwind.css')))
  .digest('hex').slice(0, 12);

function update(file) {
  const source = fs.readFileSync(file, 'utf8');
  const updated = source.replace(
    /href="\/assets\/tailwind\.css(?:\?v=[a-f0-9]+)?"/g,
    `href="/assets/tailwind.css?v=${version}"`
  );
  const brandVersion = createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'styles/brand.css')))
    .digest('hex').slice(0, 12);
  const withBrand = updated.replace(
    /href="\/styles\/brand\.css(?:\?v=[a-f0-9]+)?"/g,
    `href="/styles/brand.css?v=${brandVersion}"`
  );
  const withLogos = withBrand.replace(
    /src="(\/images\/brand\/rubix\/solvero-(?:header|footer-white)\.svg)(?:\?v=[a-f0-9]+)?"/g,
    (_, asset) => {
      const assetVersion = createHash('sha256')
        .update(fs.readFileSync(path.join(root, asset)))
        .digest('hex').slice(0, 12);
      return `src="${asset}?v=${assetVersion}"`;
    }
  );
  let withHomepage = withLogos;
  for (const asset of ['styles/homepage.css', 'assets/homepage-motion.js']) {
    const assetVersion = createHash('sha256')
      .update(fs.readFileSync(path.join(root, asset)))
      .digest('hex').slice(0, 12);
    const reference = new RegExp(`((?:href|src)="/${asset.replaceAll('.', '\\.')})(?:\\?v=[a-f0-9]+)?"`, 'g');
    withHomepage = withHomepage.replace(reference, `$1?v=${assetVersion}"`);
  }
  if (withHomepage !== source) fs.writeFileSync(file, withHomepage);
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) update(file);
  }
}

update(path.join(root, 'index.html'));
walk(path.join(root, 'services'));
walk(path.join(root, 'blog'));
walk(path.join(root, 'authors'));
walk(path.join(root, '_templates'));
console.log(`Stylesheet version: ${version}`);
