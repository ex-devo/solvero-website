# Contact form refinement

User requested an optional company name, a mandatory focus dropdown with specific business-improvement and technical delivery categories, Other / General enquiries, and a heading inside the form container inspired by Blade. Keep the existing branding and enquiry service. User authorised publication of the updated contact form and cookie banner on 25 October 2026.

## Scope
- [x] Move the heading inside the form panel: Let’s build something together.
- [x] Use the user-selected introduction: Tell us what you would like to achieve. We’ll help make it happen. This welcomes new projects and general enquiries without assuming an existing process needs to change.
- [x] Label the field Company name without an optional annotation; keep the field non-required with organisation autocomplete.
- [x] Add required What would you like help with? selection, initially blank: Business process review & improvement; Workflow automation; System & API integration; Data synchronisation & master records; Custom software & internal tools; Customer & partner portals; Reporting & dashboards; AI assistants & knowledge search; Delivery team workflows & tooling; Other / General enquiries.
- [x] Retain the existing Web3Forms submission path, accepted-only enquiry event, failure preservation and success reset. New values go to the enquiry service, never analytics.
- [x] Complete build/tests and independent review: build successful, all 73 tests pass, focused reviewer found no issues and git diff --check passes.
- [x] Serve the local homepage at http://127.0.0.1:8769/?preview=contact-enquiry#contact and queue it in the app for user review. Verify served HTML includes the mandatory selection and optional company. User review completed; publication authorised.

The categories describe enquiry topics within the existing three offers, not ten new standalone services. They do not add claims of specialist cybersecurity, predictive modelling, data warehousing or platform certifications. No real enquiry is submitted for verification; tests mock Web3Forms.

Review refinement: removed the visible optional annotation at the user’s request while retaining blank-company acceptance, and removed the assumption that an enquiry must involve changing something.

Final copy refinement: applied the user-selected outcome-led introduction, correcting the duplicate “will”. No form behaviour changed.

## Publication readiness — 25 October 2026

Fresh build and all 73 tests pass. Homepage schema retains the three visible service offers, current page metadata and organisation details; the enquiry categories do not create additional services. The final approved introduction and company label are present. The consent bundle is versioned on all 17 canonical pages. Publish the reviewed release to main and compare the deployed canonical pages and shared assets byte-for-byte with this checkout; save the deployment evidence in the task outputs. No real enquiry is submitted during automated verification.
