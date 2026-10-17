# Solvero website

Static site for Solvero, with a homepage, workflow automation service page and blog section. The content/SEO branch starts at remote commit `c8b4e5a` and preserves its colours, typography, section layouts, hero particles and technology carousel.

## Local development

Use Node.js 20.19 or newer and Python 3.

1. Run `npm ci` to install the pinned development tools.
2. Run `npm run build` after editing HTML or utility classes to regenerate the committed stylesheet and refresh its content-based version in page links. This prevents cached CSS from hiding updated styles.
3. Run `npm test` to check search metadata, structured-data references, links and enquiry handling. All form requests in these tests are mocked.
4. Run `npm run preview` and open `http://127.0.0.1:8080/` to review the site.

`npm run images` regenerates the optimised images from their original files. The original hero background remains in use to preserve its appearance. `assets/particles.js` is the original particles.js 2.0.0 library; its MIT licence is included alongside it.

## Publishing and content

The committed HTML, CSS, JavaScript, images, robots.txt and sitemap.xml can be served as static files. Node is a development dependency, not a production runtime. The canonical site is `https://solvero.co.za/`; deployment must serve the service page at `/services/workflow-automation/`.

The offer is business workflow improvement and automation, from analysis through implementation. Financial services remains a specialist sector; software team productivity is a secondary service. Case-study results, testimonials, prices and turnaround promises require confirmed source material before publication. Blog work remains separate.

The blog index is at `/blog/`, with eleven articles, twenty CSV worksheets and a separate author profile at `/authors/jateen-narsai/`. Jateen Narsai is the author; Solvero is the publisher. All fifteen canonical pages are indexable and included in the sitemap. Examples and worked figures are explicitly illustrative, rather than claimed client results.

All blog pages use the shared editorial hero: 40px titles and 40px top/bottom padding on desktop, and 32px titles and 32px top/bottom padding on mobile. Breadcrumb-to-title and title-to-byline gaps remain 32px and 24px. Set this standard in `styles/editorial.css` and the shared `hero()` generator so the index, articles and author page remain consistent.

Article images use a Markdown image followed by a single italic caption paragraph. Register each image's root-relative path, width and height in the article metadata's `images` list. Optional `image` and `image_alt` fields select its absolute social-sharing and structured-data image. The AI operating model article uses six lossless WebP illustrations.

Edit article Markdown and metadata in `_content/blog/`, author details in `_content/`, and the shared blog/author page shell in `_templates/editorial.html`. Run `npm run build` to regenerate committed pages, sitemap and styles. Publication dates remain stable in metadata; update `dateModified` only when an article changes materially. The build uses Python's standard library and the existing Node dependencies.

GitHub Pages serves the committed static output from `main` at the repository root, with `CNAME` pointing to `solvero.co.za`. Build and test locally before publishing; Pages does not run the local content generator.

After deployment, verify the public pages in Search Console and test a real enquiry with the site owner's approval. The automated checks do not establish email delivery, indexing or ranking improvements.

## Development dependency status

Tailwind 3 preserves the original site's utility behaviour. The October 2026 npm audit reports seven findings in its development dependency tree (five high, two moderate). No Node packages are served to visitors. Resolving these findings requires a separate build-tool update and visual regression check; the current branch does not claim a clean dependency audit.
