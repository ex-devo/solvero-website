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
