# Solvero website

Static site for Solvero, with a homepage, three core service pages and a blog section. The site uses the supplied Rubix cube identity, with consistent typography, section layouts, hero particles and technology expertise section.

## Local development

Use Node.js 20.19 or newer and Python 3.

1. Run `npm ci` to install the pinned development tools.
2. Run `npm run build` after editing HTML or utility classes to regenerate the committed stylesheet and refresh the content-based Tailwind and brand stylesheet versions in page links. This prevents cached CSS from hiding updated styles.
3. Run `npm test` to check search metadata, structured-data references, links and enquiry handling. All form requests in these tests are mocked.
4. Run `npm run preview` and open `http://127.0.0.1:8080/` to review the site.

`npm run images` regenerates the optimised images from their original files, including the four approved non-personal homepage photographs. Their PNG masters and generation prompts are retained in `images/photography/source/`; responsive WebP variants and dimensions are recorded in `images/photography/manifest.json`. About uses 600/900/1200px variants; expertise cards use 480/768/960/1200px variants. Photographs use WebP quality 84, fit without cropping and load lazily. The previous homepage illustrations and their masters remain preserved in `images/illustrations/`. The original stock files and their optimised versions remain in place. The separate verified backup is documented in `images/illustrations/README.md`. The original shared hero background remains in use to preserve its appearance. `assets/particles.js` is the original particles.js 2.0.0 library; its MIT licence is included alongside it.

## Brand assets and colours

`images/brand/rubix/solvero-header.svg` uses the supplied Rubix cube and original outlined wordmark, without a slogan. `solvero-footer-white.svg` is derived from the supplied white Rubix SVG, with “Technology, Solved.” beneath the wordmark. The clear gap increases from 6 to 12 vector units; the combined lettering block is centred beside the cube with a small optical adjustment. The slogan appears only in the footer artwork. All seventeen canonical pages use this identity and the matching supplied Rubix favicon set. `solvero-social.png` supplies general page sharing; articles retain their topic illustrations.

`styles/brand.css` uses the Rubix colours #1985CE, #1DC5FF and #35B0ED, with #136AA1 as the darker supporting shade. Hero panels blend #136AA1 into #1985CE, using the same gradient and translucent-overlay approach as the S-logo version. Desktop heroes and supporting sections show the existing shared background photograph, and the homepage retains its particle lines. Primary buttons use #1985CE, darken to #136AA1 on hover, and inverse white buttons use matching primary-blue text. Palette stylesheet links are content-versioned during the build. The S-symbol assets remain preserved under `images/brand/`; the older cube PNG/WebP files remain in `images/` and `images/optimised/`.

## Technology logo presentation

The homepage presents the same sixteen technologies in a static responsive grid: eight columns on desktop and four on smaller screens. Monochrome SVGs use trimmed artwork bounds and individually tuned optical sizes, with visible names and no automatic movement. Source files, pinned download URLs, licences and sizing details are retained in `images/technology/README.md` and `images/technology/manifest.json`. The original coloured raster logos remain unchanged. Update each logo's image dimensions and sizing variables together with its manifest entry when adjusting the optical balance.

## Publishing and content

The committed HTML, CSS, JavaScript, images, robots.txt and sitemap.xml can be served as static files. Node is a development dependency, not a production runtime. The canonical site is `https://solvero.co.za/`; deployment must serve the three canonical service pages and the legacy redirect pages defined in `_content/service-redirects.json`.

The offer is business improvement and solution delivery, for English-speaking businesses internationally. The three core offers are Business Operations Improvement, New Business Capabilities, and Delivery Team Effectiveness. They address improving existing operations, putting a new capability into use, and helping an existing delivery team coordinate and complete work. Review, analysis, planning, process redesign, integration, automation and software delivery are capabilities applied within the relevant engagement. Team effectiveness covers workflows, communication, information flow, task visibility and delivery practices, as well as requirements and acceptance. Copy connects client benefits to process investigation, practical redesign, implementation, testing and handover. Financial Services Expertise identifies 15 years of industry experience, with corporate and institutional credit, credit-risk and economic capital reporting, and insurance policy administration as specific disciplines. The integration section covers disparate applications, synchronisation, Single View of Party and Master Client Record initiatives. Process Improvement covers redesign, implementation and testing. Case-study results, testimonials, prices and turnaround promises require confirmed source material before publication. Article introductions and topic-specific service conclusions connect each guide to this positioning while preserving the technical examples and worksheets.

The blog index is at `/blog/`, with eleven articles, twenty CSV worksheets and a separate author profile at `/authors/jateen-narsai/`. Jateen Narsai is the author; Solvero is the publisher. All seventeen canonical pages are indexable and included in the sitemap. Examples and worked figures are explicitly illustrative, rather than claimed client results.

The blog index lists articles by publication date, newest first, with same-day articles retaining their editorial order. Each card uses its article's illustration, with dedicated 480px and 960px WebP thumbnails registered in the article metadata's `thumbnail` field. Run `node tools/optimise-blog-thumbnails.cjs` after adding or changing these thumbnails, then run the normal build. The originals used inside articles remain unchanged. The responsive index uses three columns on desktop, two on tablet and one on mobile. Its browser-side search filters titles, descriptions and topics, supports partial words and multiple terms, announces result counts, and provides a clear action and empty state. All cards and links remain present when JavaScript is disabled; no external search service is required.

All blog pages use the shared editorial hero: 40px titles and 40px top/bottom padding on desktop, and 32px titles and 32px top/bottom padding on mobile. Breadcrumb-to-title and title-to-byline gaps remain 32px and 24px. Set this standard in `styles/editorial.css` and the shared `hero()` generator so the index, articles and author page remain consistent.

Article images use a Markdown image followed by a single italic caption paragraph. Register each image's root-relative path, width and height in the article metadata's `images` list. The `image` and `image_alt` fields select its absolute social-sharing and structured-data image. Every article has topic-specific hand-drawn explainers: four each for the first ten guides and six for the AI operating model article (46 in total). The ten featured metaphors load eagerly with high priority; section illustrations load lazily. The twenty added illustrations use compressed 600/960/1536px WebP variants, responsive sizing, intrinsic dimensions, descriptive alt text and captions. Selected image details and generation prompts are retained in `images/blog/illustration-manifest.json` and `images/blog/illustration-prompts.json`. Full PNG masters remain in the separate reviewed image proposal bundle; unused revisions are excluded from publication.

Core offer content and metadata live in `_content/services.json`; `_templates/service.html` preserves the existing service-page shell. The build generates all three service pages, the three homepage cards and a matching homepage OfferCatalog and Service graph from those records. Benefit-led card headings and link text are defined alongside each service's scope, examples, delivery approach and page-specific closing CTA. Cards, article references and related-service links use the canonical URLs directly:

- `/services/business-operations-improvement/`
- `/services/new-business-capabilities/`
- `/services/delivery-team-effectiveness/`

Legacy service paths are retained as immediate, zero-second HTML meta-refresh redirects, with the destination canonical URL and an accessible link. `_content/service-redirects.json` maps Business Improvement Review, Process & Workflow Improvement and Workflow Automation to Business Operations Improvement; Solution Design & Delivery maps to New Business Capabilities. Redirects go directly to an active service and are excluded from the 17-page sitemap. GitHub Pages serves static files, so these are not HTTP 301 responses. The build validates their active targets and regenerates them each time. The four original automation examples remain within the operations page; capability planning is included in the capability-delivery page and delivery practices have their own team-effectiveness page.

Edit article Markdown and metadata in `_content/blog/`, author details in `_content/`, and the shared blog/author page shell in `_templates/editorial.html`. Run `npm run build` to regenerate committed pages, sitemap and styles. Publication dates remain stable in metadata; update `dateModified` only when an article changes materially. The build uses Python's standard library and the existing Node dependencies.

GitHub Pages serves the committed static output from `main` at the repository root, with `CNAME` pointing to `solvero.co.za`. Build and test locally before publishing; Pages does not run the local content generator.

After deployment, verify the public pages in Search Console and test a real enquiry with the site owner's approval. The automated checks do not establish email delivery, indexing or ranking improvements.

## Development dependency status

Tailwind 3 preserves the original site's utility behaviour. The October 2026 npm audit reports seven findings in its development dependency tree (five high, two moderate). No Node packages are served to visitors. Resolving these findings requires a separate build-tool update and visual regression check; the current branch does not claim a clean dependency audit.
