# Free visitor and SEO tracking

User authorised setup with free Google Analytics 4, Search Console, Bing Webmaster Tools and one reporting dashboard, using CLI/API/MCP where possible. No paid providers, subscriptions or credits. Personal Google account ownership is acceptable. Search Console is not yet verified.

Implementation uses direct GA4 tagging with basic consent: no Google tag or analytics requests until the visitor allows analytics. Advertising features remain disabled. Page URLs and referrers are sanitised; form fields are never sent. Production hostname checks keep localhost out of reports. Preferences can be changed from the footer.

## Tasks
- [x] Audit the static website, form success condition, existing tracking and available integrations.
- [x] Prepare the Solvero Analytics account wizard with optional sharing off, South African reporting time, ZAR and lead/traffic objectives; request the user's own terms acceptance.
- [x] Add tests for consent gating, withdrawal (including other tabs), duplicate protection, payload privacy, production-only operation and success-only enquiries. All 72 checks pass, including correctly versioned tracking on all 17 canonical pages.
- [x] Prepare the shared tracking script, consent styles and build integration. Configured the actual measurement ID G-HE5MVBPWQ4. Independent review confirmed one bundle on each of 17 canonical pages and no tracking on the four redirects; cross-tab withdrawal fix reviewed. Ready for publication.
- [ ] Create the web stream, configure recommended lead key event, disable automatic form/link collection and verify event arrival.
- [ ] Verify Search Console ownership, submit the sitemap and connect Analytics and Search Console.
- [ ] Add/verify Bing and submit the sitemap.
- [ ] Build the free dashboard showing visitors, channels, landing/service pages, enquiries and non-branded search performance over time; import Bing data without paid connectors.
- [ ] Run build/tests, get independent review, publish authorised tracking and verify the deployed files.

## Events
- page_view: one per consenting page load, canonical page URL and referrer origin only.
- generate_lead: contact form accepted by Web3Forms, once per successful submission; no personal form data.
- contact_click: an internal contact link or business email link, reporting only the contact type.
- service_click: a link to one of the three canonical offers, reporting only its slug.

## Verification limits
Tests mock third-party services and never send a real enquiry. Installation, browser emission and receipt in GA4 are separate checks. Google/Microsoft sign-in, terms and ownership verification may need user participation. Consent-blocked visits and visits blocked by browsers/extensions will not appear in GA4.

Search Console preparation: signed-in personal account has a pending Domain property for solvero.co.za. DNS is hosted on GoDaddy; the new verification token differs from the existing TXT record. Ownership has not been verified and no DNS changes have been made.

Created GA4 account 413352353, property 560629235, web stream 16194787788 (Solvero Website, https://solvero.co.za). User accepted account terms. Enhanced measurement is disabled. Measurement ID: G-HE5MVBPWQ4.
