# Restored article publication checks

Status: published and verified, 27 October 2026.

Publication covers the 11 restored existing articles and agreed site changes. Bank Zero remains a local review draft at the owner’s request and is absent from the public index, sitemap and structured-data graph. Its proposal files are not part of the deployment commit.

The existing article wording remains the saved pre-humanizer copy, with later presentation decisions retained: author biographies stay on the author profile and the compact AI overview image stays in its header.

## Local checks

- [Build](build.log): passed.
- [Site tests](tests.log): 83 passed, 0 failed.
- [Independent review](review.md): no actionable findings.
- All 17 canonical pages passed local Schema.org vocabulary, reference, page-content, date, image and draft-exclusion checks.
- [Final schema snippets](snippets.json) record the exact payload hashes sent to Google.

## Google Rich Results Test

[Results](google-rich-results.json): all 17 canonical pages passed using code input and the smartphone inspection agent, with 0 critical errors. Results are matched to the final local JSON-LD by SHA-256. The shared Organisation has optional streetAddress and postalCode notices; no complete street address has been confirmed, so those fields remain absent. [Notice details](google-organisation.png).

Each article reports a valid Articles item. The author profile and service breadcrumbs also pass. [Restored article result](google-restored-article.png).

## Per-page results

| Page | Valid items | Google result |
|---|---:|---|
| / | 1 | [Result](https://search.google.com/test/rich-results/result?id=DI3H7SFkzejNCNNz4CFDBw) |
| /services/business-operations-improvement/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=FPo2E9SdJabDT73OrjuUVA) |
| /services/new-business-capabilities/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=txOS3HimiMecNfhrjHTkmg) |
| /services/delivery-team-effectiveness/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=7TY21qC6PG5ta1_Lrc670g) |
| /blog/ | 1 | [Result](https://search.google.com/test/rich-results/result?id=AR0Lw0pDx92jrbdg6XU5dg) |
| /blog/which-processes-to-automate/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=a7KQzKKNtmVUd6z2h_QNJw) |
| /blog/reduce-duplicate-data-entry/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=5Xl_c6Wydsf9wYE4J1sNug) |
| /blog/approval-workflow-automation/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=My2KLSogaxKZhmgczgPt4g) |
| /blog/identify-process-bottlenecks/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=Ruhbbe-umu1R83ET1b-Hdw) |
| /blog/workflow-automation-roi/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=A5vR0QE_NyXd1_ZgQIaJoQ) |
| /blog/customer-onboarding-automation/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=zYkq3_5kmLiATN40YZpgIg) |
| /blog/workflow-automation-project-cost/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=6P4Ljt6-YTHITQNT7c18Cw) |
| /blog/quote-to-invoice-automation/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=jEWwZmf4vcyrQ9jZpGl62A) |
| /blog/ai-vs-rules-based-automation/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=vD36XS0kyQNb5XE8uBtXYA) |
| /blog/n8n-vs-power-automate/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=KTB9mrG1AoAhSxRD1_bXwQ) |
| /blog/ai-operating-model/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=7dvgvGerR1bB1nNzYm2TGw) |
| /authors/jateen-narsai/ | 2 | [Result](https://search.google.com/test/rich-results/result?id=E1N0tzB6Ie32HWnPDaClnQ) |

## Deployment

The site was committed and pushed to main as `820a6af00cf06397d58027f9460829f7751bdeac`. [GitHub Pages](pages-deployment.json) completed successfully at 13:08:55 UTC on 27 October 2026.

[Live verification](live-verification.json) confirmed that all 17 public pages match both the Google-tested JSON-LD hashes and the local visible text. Five changed assets also match their local files. Bank Zero remains absent from the public index and sitemap; none of its proposal files were included in the publication commit.

A further [Google live URL test](https://search.google.com/test/rich-results/result?id=2EqPj2rAX575go-JhksmKw) successfully crawled the published AI article and detected 2 valid items with no critical errors. [Receipt](google-live-url.json), [screenshot](google-live-url.png). The same two optional organisation address recommendations remain.

This confirms deployment and validation, without making a claim about search indexing or rankings.
