# Three Service Offers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this approved plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Preview three distinct homepage offers and matching detailed pages, with solution delivery consolidated into systems integration and automation.

**Architecture:** Make `_content/services.json` the source for all three service pages, homepage cards and the homepage service catalogue schema. Keep `/services/workflow-automation/` as the established integration URL; generate an immediate static redirect and canonical at `/services/solution-design-delivery/`. Update article sources and metadata to link directly to the consolidated service.

**Tech Stack:** Existing Python content generator, static HTML, Tailwind CSS and Node/JSDOM tests. No added dependencies.

**Spec:** User-approved request in this chat on 22 October 2026: three cards, three consolidated pages, effective CTAs, updated internal links/schema, local preview before publication. `README.md`, `AGENTS.md` and `docs/website-copy-guide.md` supply positioning and writing constraints.

## Global Constraints

- Preserve Rubix branding, textured hero, fonts, existing imagery, technology grid and contact form; leave homepage hero wording to the separate voice task.
- Offers: Business Improvement Review; Process & Workflow Improvement; Systems Integration & Automation. Solution Design & Delivery sits within the third.
- Retain capability planning and development-team support within the relevant offers, with useful anchor links.
- Preserve all article dates, images, examples and downloads; change service references only.
- Preview only: no commit, push or publication in this task. Preserve existing untracked writing guides and Serena configuration.

## Review Focus

- Existing solution-delivery bookmarks reach the correct consolidated page without JavaScript; exclude the old URL from the sitemap.
- Build reruns cannot recreate the old fourth service or duplicate the automation URL in the sitemap.
- Article CTAs and metadata point directly to a valid primary offer.
- Homepage catalogue and service schema describe the same three offers and have valid references.
- Capabilities, practical automation examples and delivery responsibilities survive consolidation; local navigation remains local.

### Task 1: Consolidate offers, links and metadata

**Files:** `_content/services.json`, `tools/build-content.py`, `index.html`, `_content/blog/*.md`, `_content/blog/metadata.json`, generated `services/`, `blog/`, `sitemap.xml`, `tests/site.test.cjs`, new `tests/service-consolidation.test.cjs`, `README.md`.

**Interfaces:** Existing service records gain card description/link text/icon/colour and optional case studies/supporting-capability content. `service_main(offer)` renders all three pages; the builder replaces only the existing homepage services section and synchronises its catalogue graph. Articles retain the existing `offer` slug interface.

- [x] Add tests for the three linked cards, valid catalogue schema, retired URL handling, no links to the old URL and retained supporting sections.
- [x] Run `node --test tests/service-consolidation.test.cjs`; confirm expected failures against the four-page/six-card site.
- [x] Consolidate service data and generator; move meaningful integration examples and solution-delivery content into the third offer, with capability planning in the review and team support in delivery.
- [x] Replace retired article links and offer slugs; regenerate canonical pages and a 17-URL sitemap.
- [x] Run `npm run build`, `npm test` and `git diff --check`; confirm a repeat content build is stable.

### Task 2: Review and show the local site

**Files:** This plan, local review artifacts and existing preview server.

**Interfaces:** All 17 canonical pages and the retired route served from the same unchanged static hosting model.

- [x] Run a fresh independent code review against the approved scope and resolve material findings.
- [x] Verify local HTTP pages, images, links, canonical metadata, old-route redirect and search; preserve the live site unchanged.
- [x] Open the local homepage in Codex and provide direct links to the services for the user's review.

## Progress and rulings

- Working in the existing checkout preserves the user's current local preview and in-progress writing guides. Changes remain uncommitted pending review, matching the explicit preview-before-publishing request.
- GitHub Pages serves static files. Use a zero-second meta refresh plus canonical for the retired URL, rather than claiming a configurable HTTP 301. Google's redirect guidance recognises immediate meta refresh as a permanent redirect signal.

- Completed: three canonical offers, regenerated pages and direct article links; retired route redirects without scripting. All 55 tests pass, repeat build is stable and local HTTP serves 17 canonical pages plus the retired route and shared assets.
- Review: fresh Astra reviewer found no Critical or Important findings. Its optional blog-index link-label suggestion was incorporated and the build and full suite rerun.
- Preview: http://127.0.0.1:8769/#services dispatched to Codex browser; user review is pending. No commit, push or publication performed.

## Release status — 26 October 2026

The approved offer structure is now Business Process Improvement, New Business Capabilities and Delivery Team Effectiveness, as recorded in README.md and _content/services.json. The original implementation notes above record the earlier proposal. Subsequent user-approved copy, About and Expertise changes, aligned structured data, centred calls to action and blog-card focus fixes are implemented. Past-project examples remain deferred pending confirmed details.

The user has authorised publishing the latest local site. Fresh build and all 73 tests pass; the two card interaction fixes have been checked in the local browser. The release uses the established GitHub Pages deployment from main at the repository root. Optional structured-data address and article time recommendations remain documented in the local review evidence.
