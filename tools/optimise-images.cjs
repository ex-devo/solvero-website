const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'images', 'optimised');

async function optimise() {
  await fs.mkdir(output, { recursive: true });
  const jobs = [
    ['hero-bg.jpg', 'hero-bg.webp', 1440, 60],
    ['about.jpg', 'about.webp', 800, 75],
    ['finance.jpg', 'finance.webp', 640, 75],
    ['insurance.jpg', 'insurance.webp', 640, 75],
    ['analytics.jpg', 'analytics.webp', 640, 75],
    ['Solvero Main Logo.png', 'solvero-logo.webp', 480, 90],
    ['Solvero Logo Symbol.png', 'solvero-icon.png', 64, 90]
  ];
  for (const [source, name, width, quality] of jobs) {
    const image = sharp(path.join(root, 'images', source)).resize({ width, withoutEnlargement: true });
    if (name.endsWith('.png')) await image.png().toFile(path.join(output, name));
    else await image.webp({ quality }).toFile(path.join(output, name));
  }
  const illustrations = path.join(root, 'images', 'illustrations');
  const approved = [
    ['about-practical-improvement', [600, 900, 1200]],
    ['financial-services-clear-decisions', [480, 768, 960, 1200]],
    ['connected-client-information', [480, 768, 960, 1200]],
    ['process-visibility-bottleneck', [480, 768, 960, 1200]]
  ];
  for (const [name, widths] of approved) {
    for (const width of widths) {
      await sharp(path.join(illustrations, 'source', `${name}.png`))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 86, effort: 6 })
        .toFile(path.join(illustrations, `${name}-${width}.webp`));
    }
  }
  for (const name of await fs.readdir(path.join(root, 'images', 'Logos'))) {
    if (!name.endsWith('.png')) continue;
    await sharp(path.join(root, 'images', 'Logos', name))
      .resize({ height: 144, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(output, `${path.basename(name, '.png')}.webp`));
  }
}

optimise().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
