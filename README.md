# Solvero website

Static site for Solvero, with a homepage, three core offer pages, a workflow automation service page and blog section. The content/SEO branch starts at remote commit `c8b4e5a` and preserves its colours, typography, section layouts, hero particles and technology carousel.

## Local development

Use Node.js 20.19 or newer and Python 3.

1. Run `npm ci` to install the pinned development tools.
2. Run `npm run build` after editing HTML or utility classes to regenerate the committed stylesheet and refresh its content-based version in page links. This prevents cached CSS from hiding updated styles.
3. Run `npm test` to check search metadata, structured-data references, links and enquiry handling. All form requests in these tests are mocked.
4. Run `npm run preview` and open `http://127.0.0.1:8080/` to review the site.

`npm run images` regenerates the optimised images from their original files, including the four approved homepage illustrations. Their PNG masters and generation prompts are retained in `images/illustrations/source/`; responsive WebP variants live in `images/illustrations/`. About uses 600/900/1200px variants; expertise cards use 480/768/960/1200px variants. The card images fit without cropping, and all four illustrations load lazily. The original stock files and their optimised versions remain in place. The separate verified backup is documented in `images/illustrations/README.md`. The original shared hero background remains in use to preserve its appearance. `assets/particles.js` is the original particles.js 2.0.0 library; its MIT licence is included alongside it.

## Publishing and content

The committed HTML, CSS, JavaScript, images, robots.txt and sitemap.xml can be served as static files. Node is a development dependency, not a production runtime. The canonical site is `https://solvero.co.za/`; deployment must serve the service page at `/services/workflow-automation/`.

The offer is business improvement and solution delivery, for English-speaking businesses internationally. The three core offers are Business Improvement Review, Process & Workflow Improvement, and Solution Design & Delivery. Systems integration and automation, business capability planning, and development-team effectiveness are supporting capabilities. Copy connects client benefits to process investigation, practical redesign, implementation, testing and handover. Banking and insurance remain areas of professional experience. Case-study results, testimonials, prices and turnaround promises require confirmed source material before publication. Article introductions and topic-specific service conclusions connect each guide to this positioning while preserving the technical examples and worksheets.

The blog index is at `/blog/`, with eleven articles, twenty CSV worksheets and a separate author profile at `/authors/jateen-narsai/`. Jateen Narsai is the author; Solvero is the publisher. All eighteen canonical pages are indexable and included in the sitemap. Examples and worked figures are explicitly illustrative, rather than claimed client results.

All blog pages use the shared editorial hero: 40px titles and 40px top/bottom padding on desktop, and 32px titles and 32px top/bottom padding on mobile. Breadcrumb-to-title and title-to-byline gaps remain 32px and 24px. Set this standard in `styles/editorial.css` and the shared `hero()` generator so the index, articles and author page remain consistent.

Article images use a Markdown image followed by a single italic caption paragraph. Register each image's root-relative path, width and height in the article metadata's `images` list. The `image` and `image_alt` fields select its absolute social-sharing and structured-data image. Every article has topic-specific hand-drawn explainers: four each for the first ten guides and six for the AI operating model article (46 in total). The ten featured metaphors load eagerly with high priority; section illustrations load lazily. The twenty added illustrations use compressed 600/960/1536px WebP variants, responsive sizing, intrinsic dimensions, descriptive alt text and captions. Selected image details and generation prompts are retained in `images/blog/illustration-manifest.json` and `images/blog/illustration-prompts.json`. Full PNG masters remain in the separate reviewed image proposal bundle; unused revisions are excluded from publication.

Core offer content and metadata live in `_content/services.json`; `_templates/service.html` preserves the existing service-page shell. The build generates the three offer pages with unique titles, canonical URLs and Service structured data. Homepage offer cards and each article link to the relevant core offer, and offer pages link back to practical guides. The established automation page keeps its URL and describes the technical delivery option.

Edit article Markdown and metadata in `_content/blog/`, author details in `_content/`, and the shared blog/author page shell in `_templates/editorial.html`. Run `npm run build` to regenerate committed pages, sitemap and styles. Publication dates remain stable in metadata; update `dateModified` only when an article changes materially. The build uses Python's standard library and the existing Node dependencies.

GitHub Pages serves the committed static output from `main` at the repository root, with `CNAME` pointing to `solvero.co.za`. Build and test locally before publishing; Pages does not run the local content generator.

After deployment, verify the public pages in Search Console and test a real enquiry with the site owner's approval. The automated checks do not establish email delivery, indexing or ranking improvements.

## Development dependency status

Tailwind 3 preserves the original site's utility behaviour. The October 2026 npm audit reports seven findings in its development dependency tree (five high, two moderate). No Node packages are served to visitors. Resolving these findings requires a separate build-tool update and visual regression check; the current branch does not claim a clean dependency audit.
