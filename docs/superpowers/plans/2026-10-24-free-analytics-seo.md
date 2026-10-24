# Free visitor and SEO tracking

User authorised setup with free Google Analytics 4, Search Console, Bing Webmaster Tools and one reporting dashboard, using CLI/API/MCP where possible. No paid providers, subscriptions or credits. Personal Google account ownership is acceptable. Search Console Domain ownership is verified; the sitemap was processed successfully with 17 discovered pages.

Implementation uses direct GA4 tagging with basic consent: no Google tag or analytics requests until the visitor allows analytics. Advertising features remain disabled. Page URLs and referrers are sanitised; form fields are never sent. Production hostname checks keep localhost out of reports. Preferences can be changed from the footer.

## Tasks
- [x] Audit the static website, form success condition, existing tracking and available integrations.
- [x] Prepare the Solvero Analytics account wizard with optional sharing off, South African reporting time, ZAR and lead/traffic objectives; request the user's own terms acceptance.
- [x] Add tests for consent gating, withdrawal (including other tabs), duplicate protection, payload privacy, production-only operation and success-only enquiries. All 72 checks pass, including correctly versioned tracking on all 17 canonical pages.
- [x] Prepare the shared tracking script, consent styles and build integration. Configured the actual measurement ID G-HE5MVBPWQ4. Independent review confirmed one bundle on each of 17 canonical pages and no tracking on the four redirects; cross-tab withdrawal fix reviewed. Published in commit 3f275945587ab29456b2af6c3adef4774c5f5824; Pages built successfully and all 27 checked files match the release.
- [x] Create the web stream, configure generate_lead as a key event (once per session, no default monetary value), disable enhanced measurement and verify receipt of one consenting page_view in Realtime. A real enquiry has not been submitted or used for arrival verification.
- [x] Verify Search Console ownership, process the sitemap (17 pages discovered) and create the native GA4/Search Console link for the actual web stream.
- [x] Add/verify Bing after the user approved Google profile/email sign-in, publish the ownership tag and submit the sitemap. Bing reports Processing and requests 48 hours to prepare performance data.
- [x] Build and reopen the private Google visitor/search dashboard: daily trends, summary cards, source/medium, page path, country/device tables and all/non-branded query tables. Verify Restricted sharing with the owner only.
- [ ] Import actual Bing data without paid connectors once Bing makes an export available. The third report page states the current preparation status, source links and manual CSV refresh requirements; no fake data or unconnected chart claims.
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

Data Studio first-use terms accepted by the user; optional emails No. Private report 54110689-e8fb-41ab-b2ee-0db378fd50a9 renamed Solvero — Visitors & Search Performance. The authorised Analytics source is connected. Visitors & enquiries page built with daily Views/Total users trend, four summary cards, source/medium, page path, country and device tables, responsive layout and coverage notes. Visitor default is rolling last 28 days including today; the viewer was reopened and saved content verified. Accepted enquiries is Event count filtered to Event name = generate_lead. No genuine test enquiry submitted.

Both GoDaddy authoritative nameservers now show the new TXT token alongside preserved older records. Search Console sc-domain:solvero.co.za ownership verified; sitemap processed successfully and 17 pages discovered. Immediate initial fetch warning cleared. Public sitemap is HTTP 200 application/xml and robots.txt allows crawling.

Google search report page p_2eo62xin8d has the authorised Site Impression web source, Clicks/Impressions trend, Clicks/Impressions/Site CTR/Average Position summary cards and all/non-branded query tables. The non-branded table excludes Query RegExp Contains (?i)solvero. Saved visitor and search pages were reopened and checked; notes explain processing delay and query omissions. The Google search page defaults to last 28 completed days; the visitor page now includes today. Sharing was checked: owner only, Restricted.

The user corrected the TXT record from the wrong domain to solvero.co.za; both authoritative nameservers and successful Google ownership/sitemap checks confirm the correction. The native GA4/Search Console link was created and confirmed for web stream 16194787788.

Bing sign-in completed after explicit approval to share Google name/profile picture/email. The homepage verification tag was reviewed, survived the build and passed all 72 tests. Published release 4d19a6c522a0d8fb88b7ec9b41371f96be73ddfd is built and the exact live tag was verified. Bing site verification completed; sitemap submitted, Processing with no errors/warnings. Bing Search Performance requests 48 hours before data is ready; AI Performance has no data available. Report page p_c3nlkgjn8d (Bing & AI search) links these source tools and explicitly states Bing is not connected to charts. Free CSV import remains pending actual data and will require manual refresh with a visible import date. No paid connector, recurring job or fabricated rows were added. No API keys or browser access tokens saved in the repository.

Follow-up on the empty visitor dashboard: default excluded the installation day and cached summary cards retained earlier empty results. Selecting today showed data in the source/page tables; Refresh data returned 2 Views, 2 Sessions and 2 Total users in the cards. Saved visitor default corrected to today minus 27 days through today using the date picker; previewed dates and reopened viewer confirmed 27 September–24 October and the same totals. Coverage note updated; initial-day trend point markers enabled. Counts include setup visits. No genuine enquiry recorded and no website code changed.
