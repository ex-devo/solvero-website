# Free visitor and SEO tracking

User authorised setup with free Google Analytics 4, Search Console, Bing Webmaster Tools and one reporting dashboard, using CLI/API/MCP where possible. No paid providers, subscriptions or credits. Personal Google account ownership is acceptable. Search Console Domain ownership is verified; the sitemap was processed successfully with 17 discovered pages.

Implementation uses direct GA4 tagging with basic consent: no Google tag or analytics requests until the visitor allows analytics. Advertising features remain disabled. Page URLs and referrers are sanitised; form fields are never sent. Production hostname checks keep localhost out of reports. Preferences can be changed from the footer.

## Tasks
- [x] Audit the static website, form success condition, existing tracking and available integrations.
- [x] Prepare the Solvero Analytics account wizard with optional sharing off, South African reporting time, ZAR and lead/traffic objectives; request the user's own terms acceptance.
- [x] Add tests for consent gating, withdrawal (including other tabs), duplicate protection, payload privacy, production-only operation and success-only enquiries. All 72 checks pass, including correctly versioned tracking on all 17 canonical pages.
- [x] Prepare the shared tracking script, consent styles and build integration. Configured the actual measurement ID G-HE5MVBPWQ4. Independent review confirmed one bundle on each of 17 canonical pages and no tracking on the four redirects; cross-tab withdrawal fix reviewed. Published in commit 3f275945587ab29456b2af6c3adef4774c5f5824; Pages built successfully and all 27 checked files match the release.
- [x] Create the web stream, configure generate_lead as a key event (once per session, no default monetary value), disable enhanced measurement and verify receipt of one consenting page_view in Realtime. A real enquiry has not been submitted or used for arrival verification.
- [ ] Verify Search Console ownership, submit the sitemap and connect Analytics and Search Console.
- [ ] Add/verify Bing and submit the sitemap.
- [ ] Build the free dashboard showing visitors, channels, landing/service pages, enquiries and non-branded search performance over time; import Bing data without paid connectors.
- [x] Run build/tests (72 passing), get independent review, publish authorised tracking and verify the deployed files (27/27).

## Events
- page_view: one per consenting page load, canonical page URL and referrer origin only.
- generate_lead: contact form accepted by Web3Forms, once per successful submission; no personal form data.
- contact_click: an internal contact link or business email link, reporting only the contact type.
- service_click: a link to one of the three canonical offers, reporting only its slug.

## Verification limits
Tests mock third-party services and never send a real enquiry. Installation, browser emission and receipt in GA4 are separate checks. Google/Microsoft sign-in, terms and ownership verification may need user participation. Consent-blocked visits and visits blocked by browsers/extensions will not appear in GA4.

## Account and dashboard status

GA4 account 413352353, property 560629235, web stream 16194787788 (Solvero Website, https://solvero.co.za). User accepted account terms. Enhanced measurement is disabled. Measurement ID G-HE5MVBPWQ4.

Data Studio first-use terms accepted by the user; optional emails No. Private report 54110689-e8fb-41ab-b2ee-0db378fd50a9 renamed Solvero — Visitors & Search Performance. The authorised Analytics source is connected. Visitors & enquiries page built with daily Views/Total users trend, four summary cards, source/medium, page path, country and device tables, responsive layout and coverage notes. Saved default is last 28 completed days excluding today; the viewer was reopened and saved content verified. Accepted enquiries is Event count filtered to Event name = generate_lead. No genuine test enquiry submitted.

Both GoDaddy authoritative nameservers now show the new TXT token alongside preserved older records. Search Console sc-domain:solvero.co.za ownership verified; sitemap processed successfully and 17 pages discovered. Immediate initial fetch warning cleared. Public sitemap is HTTP 200 application/xml and robots.txt allows crawling.

Google search report page p_2eo62xin8d now has the authorised Site Impression web source, a Clicks/Impressions trend and query tables. Non-branded queries exclude case-insensitive Solvero matches with a RegExp Contains filter; chart verification/layout remains in progress. The user confirmed moving the TXT record from the wrong domain to solvero.co.za; the correct record and verification are confirmed. User explicitly approved sharing Google profile/name/email with Bing, sign-in completed and https://solvero.co.za/ was added. Public ownership tag from Bing is prepared on the homepage and survived the build; independent review found no issue and all 72 tests pass. Bing verification awaits publication of that tag. GA4/Search Console linking, final search dashboard verification and Bing integration remain pending. No API keys or access tokens saved in repository; report sharing unchanged/private.
