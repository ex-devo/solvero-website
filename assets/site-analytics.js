(() => {
  'use strict';
  const measurementId = document.currentScript?.dataset.measurementId;
  const hosts = ['solvero.co.za', 'www.solvero.co.za'];
  if (!hosts.includes(location.hostname) || !/^G-[A-Z0-9]+$/.test(measurementId || '') || window.solveroAnalyticsInstalled) return;
  window.solveroAnalyticsInstalled = true;
  const preferenceKey = 'solvero.analytics-consent.v1';
  const maxAge = 180 * 86400000;
  const disableKey = `ga-disable-${measurementId}`;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;
  const page = new URL(canonical.href);
  if (!hosts.includes(page.hostname)) return;
  const pageLocation = page.origin + page.pathname;
  let enabled = false;
  let initialised = false;
  let pageViewSent = false;
  let preferencesOpened = false;
  window[disableKey] = true;

  function savedChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey));
      if (saved?.version !== 1 || !['granted', 'denied'].includes(saved.decision) || !Number.isFinite(saved.updatedAt)) return null;
      const age = Date.now() - saved.updatedAt;
      return age >= 0 && age < maxAge ? saved.decision : null;
    } catch { return null; }
  }

  function referrerOrigin() {
    if (!document.referrer) return '';
    return new URL(document.referrer).origin + '/';
  }

  function campaignFields() {
    const search = new URLSearchParams(location.search);
    const fields = {};
    for (const [query, field] of [['utm_source', 'campaign_source'], ['utm_medium', 'campaign_medium'], ['utm_campaign', 'campaign_name'], ['utm_content', 'campaign_content'], ['utm_term', 'campaign_term']]) {
      const value = search.get(query) || '';
      fields[field] = /^[a-z0-9][a-z0-9._-]{0,79}$/i.test(value) ? value.toLowerCase() : '';
    }
    return fields;
  }

  function send(name, parameters) {
    if (!enabled) return;
    window.gtag('event', name, { ...parameters, page_location: pageLocation });
  }

  function allow() {
    enabled = true;
    window[disableKey] = false;
    if (!initialised) {
      initialised = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('config', measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_expires: 90 * 86400,
        cookie_flags: 'SameSite=Lax;Secure',
        page_location: pageLocation,
        page_referrer: referrerOrigin(),
        ...campaignFields()
      });
      const tag = document.createElement('script');
      tag.async = true;
      tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.append(tag);
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!pageViewSent) {
      pageViewSent = true;
      send('page_view', { page_title: document.title, page_referrer: referrerOrigin(), ...campaignFields() });
    }
  }

  function reject() {
    enabled = false;
    window[disableKey] = true;
    if (initialised) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (name !== '_ga' && name !== `_ga_${measurementId.slice(2)}`) continue;
      for (const domain of ['', location.hostname, 'solvero.co.za']) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax; Secure${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }

  const banner = document.createElement('section');
  banner.className = 'analytics-consent';
  banner.dataset.analyticsConsent = '';
  banner.setAttribute('aria-labelledby', 'analytics-consent-heading');
  banner.innerHTML = '<div class="analytics-consent-copy"><h2 id="analytics-consent-heading">Your analytics choice</h2><p>With your permission, Google Analytics measures visits and accepted enquiries to help us improve this site. We do not send contact-form contents or use analytics for advertising.</p><details><summary>What is stored?</summary><p>Analytics cookies can last up to 90 days. Your choice is saved in this browser for 180 days. You can change it using Analytics preferences in the footer.</p></details></div><div class="analytics-consent-actions"><button type="button" data-analytics-allow>Allow analytics</button><button type="button" data-analytics-reject>Reject analytics</button></div>';
  document.body.append(banner);
  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'analytics-preferences';
  preferences.dataset.analyticsPreferences = '';
  preferences.textContent = 'Analytics preferences';
  document.querySelector('footer').append(preferences);
  preferences.addEventListener('click', () => {
    preferencesOpened = true;
    banner.hidden = false;
    banner.querySelector('[data-analytics-allow]').focus();
  });
  function choose(decision) {
    try { localStorage.setItem(preferenceKey, JSON.stringify({ version: 1, decision, updatedAt: Date.now() })); } catch { /* The current choice still applies when browser storage is unavailable. */ }
    if (decision === 'granted') allow(); else reject();
    banner.hidden = true;
    if (preferencesOpened) preferences.focus();
    preferencesOpened = false;
  }
  banner.querySelector('[data-analytics-allow]').addEventListener('click', () => choose('granted'));
  banner.querySelector('[data-analytics-reject]').addEventListener('click', () => choose('denied'));
  const saved = savedChoice();
  banner.hidden = saved !== null;
  if (saved === 'granted') allow();
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== preferenceKey) return;
    const decision = savedChoice();
    if (decision === 'granted') allow(); else reject();
    banner.hidden = decision !== null;
  });

  document.addEventListener('solvero:enquiry-accepted', () => send('generate_lead', { form_name: 'contact' }));
  document.addEventListener('click', event => {
    if (!enabled) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href);
    if (url.protocol === 'mailto:') {
      send('contact_click', { contact_type: 'email' });
    } else if (url.origin === location.origin) {
      if (url.hash === '#contact') send('contact_click', { contact_type: 'form' });
      const service = url.pathname.match(/^\/services\/(business-operations-improvement|new-business-capabilities|delivery-team-effectiveness)\/$/);
      if (service) send('service_click', { service: service[1] });
    }
  });
})();
