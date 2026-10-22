# Client-Need Service Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this approved plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Preview three service offers based on distinct client needs, with matching cards, pages, links and schema.

**Architecture:** Keep the existing metadata-driven service renderer. Replace the three service records with Business Operations Improvement, New Business Capabilities and Delivery Team Effectiveness; use separate benefit-led card headings. Add a fixed legacy-route map so all four previous service URLs redirect directly to relevant active pages. Keep three canonical service pages and 17 sitemap URLs.

**Tech Stack:** Existing static HTML, Python content generator, Tailwind and JSDOM tests. No added dependencies.

**Spec:** User-approved descriptions and latest implementation request in this chat, 22 October 2026; `AGENTS.md`, `docs/website-copy-guide.md`, `docs/article-writing-guide.md` and `README.md` supply writing and evidence requirements.

## Global Constraints

- The local preview has been reviewed. Publish the approved service update after fresh build, tests and final review; verify the deployment and live pages.
- Operations improves existing work; capabilities introduces something the business cannot currently do; team effectiveness improves how an existing delivery team coordinates and completes work.
- Review, analysis, process changes, integration, software and automation are delivery capabilities, rather than separate peer offers.
- Team effectiveness covers workflows, handoffs, communication, information flow, task visibility, ownership, priorities and delivery practices.
- Preserve look and feel, hero copy, Rubix branding, images, technology grid, contact form and all article dates, images and downloads.

## Review Focus

- Four old URLs redirect directly, without chains, to an active page; the old fourth offer cannot reappear after a build.
- Cards, Service/OfferCatalog schema, metadata, related-service links and sitemap identify the same three offers.
- Article links use the relevant new offer; article content remains useful and its technical body is preserved.
- Team effectiveness has concrete coordination/visibility content, not only requirements support.
- The new-capability offer describes a delivered capability; operations includes improvements beyond automation.

### Task 1: Replace the three offers and migrate their references

**Files:** `_content/services.json`, new `_content/service-redirects.json`, `tools/build-content.py`, `_content/blog/*.md`, `_content/blog/metadata.json`, `tests/service-consolidation.test.cjs`, generated homepage, service/article pages and sitemap.

**Interfaces:** Each service gains required `cardHeading`, `useCasesHeading`, `useCasesIntro`, `closingHeading` and `closingIntro`. Redirect records have `from` and `to` root-relative directory URLs. Retired slugs are excluded from active service metadata and the sitemap.

- [x] Update the consolidation tests for the three new canonical routes, four direct redirects, catalogue consistency and retained service detail; run them and observe expected failures against the current preview.
- [x] Save the existing preview sources and output as a local backup outside the repository.
- [x] Write the three complete service records, including scope, outputs, steps, examples, FAQ and outcome-focused CTAs.
- [x] Update the generator to use the new headings, section introductions and closing CTAs, and generate direct redirects from the fixed route map.
- [x] Update article links, relevant closing descriptions and offer metadata; regenerate the site, sitemap and styles.
- [x] Run `npm run build`, `npm test`, `git diff --check` and a repeat-build stability check.

### Task 2: Review and show the preview

**Files:** `README.md`, `docs/website-copy-guide.md`, this plan and local review artifacts.

**Interfaces:** The local static preview serves all canonical pages and legacy redirects from the existing checkout.

- [x] Update guidance to describe the approved client-need hierarchy and route mappings.
- [x] Get an independent code and content review; resolve material findings.
- [x] Verify local HTTP responses, asset/fragment links and preservation of the unchanged homepage sections and article metadata.
- [x] Open the local homepage and provide links for review, before the user-authorised publication.

## Progress

- The user has approved the revised three-offer structure and implementation. Preserve the previous local preview in an artifact backup; update the same checkout to keep the existing preview URL useful.

- Completed: all three client-need offers, direct article links, matching schema and a 17-page sitemap; all four former service URLs redirect directly to an active page.
- Verification: build and all 55 tests pass; repeat content build is stable; all 17 canonical pages, four redirect pages and six shared assets verified through local HTTP. Homepage hero and non-service sections, article images, downloads and dates are preserved.
- Independent review: no Critical or Important findings; team-effectiveness scope and distinct client needs checked.
- Preview dispatched: http://127.0.0.1:8769/?preview=client-needs#services . The user has reviewed the preview and authorised publication of the service update.

- Release wording approved 22 October 2026: “Make your delivery team more effective” on the third card and corresponding service hero. The prior QA and review steps are complete; fresh publication checks run before the release commit.
