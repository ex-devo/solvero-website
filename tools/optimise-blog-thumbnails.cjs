const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');

(async () => {
  const articles = JSON.parse(await fs.readFile(path.join(root, '_content/blog/metadata.json'), 'utf8'));
  for (const article of articles) {
    const thumbnail = article.thumbnail;
    const source = path.join(root, thumbnail.source);
    for (const variant of thumbnail.variants) {
      const target = path.join(root, variant.src);
      await fs.mkdir(path.dirname(target), { recursive: true });
      const result = await sharp(source).resize({ width: variant.width }).webp({ quality: 82, effort: 6 }).toFile(target);
      if (result.width !== variant.width || result.height !== variant.height) {
        throw new Error(`Thumbnail dimensions differ from metadata: ${variant.src}`);
      }
    }
  }
  console.log(`Created ${articles.length * 2} responsive blog thumbnails; article originals are unchanged.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
