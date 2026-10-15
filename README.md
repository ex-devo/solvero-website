# Solvero website

Static site for Solvero, with a homepage and workflow automation service page. The content/SEO branch starts at remote commit `c8b4e5a` and preserves its colours, typography, section layouts, hero particles and technology carousel.

## Local development

Use Node.js 20.19 or newer and Python 3.

1. Run `npm ci` to install the pinned development tools.
2. Run `npm run build` after editing HTML or utility classes to regenerate the committed stylesheet.
3. Run `npm test` to check search metadata, structured-data references, links and enquiry handling. All form requests in these tests are mocked.
4. Run `npm run preview` and open `http://127.0.0.1:8080/` to review the site.

`npm run images` regenerates the optimised images from their original files. The original hero background remains in use to preserve its appearance. `assets/particles.js` is the original particles.js 2.0.0 library; its MIT licence is included alongside it.

## Publishing and content

The committed HTML, CSS, JavaScript, images, robots.txt and sitemap.xml can be served as static files. Node is a development dependency, not a production runtime. The canonical site is `https://solvero.co.za/`; deployment must serve the service page at `/services/workflow-automation/`.

The offer is business workflow improvement and automation, from analysis through implementation. Financial services remains a specialist sector; software team productivity is a secondary service. Case-study results, testimonials, prices and turnaround promises require confirmed source material before publication. Blog work remains separate.

After deployment, verify the public pages in Search Console and test a real enquiry with the site owner's approval. The automated checks do not establish email delivery, indexing or ranking improvements.

## Development dependency status

Tailwind 3 preserves the original site's utility behaviour. The October 2026 npm audit reports seven findings in its development dependency tree (five high, two moderate). No Node packages are served to visitors. Resolving these findings requires a separate build-tool update and visual regression check; the current branch does not claim a clean dependency audit.
