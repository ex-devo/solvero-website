"""Generate the published blog and biography; committed HTML is served by Pages."""
from pathlib import Path
import copy
import hashlib
import html
import importlib.util
import json
import math
import re
import xml.etree.ElementTree as ET
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / '_content'
SITE = 'https://solvero.co.za/'
META = json.loads((CONTENT / 'blog/metadata.json').read_text())
AUTHOR = json.loads((CONTENT / 'author.json').read_text())
SERVICES = json.loads((CONTENT / 'services.json').read_text())
REDIRECTS = json.loads((CONTENT / 'service-redirects.json').read_text())
TRACKING = json.loads((CONTENT / 'tracking.json').read_text())
MEASUREMENT_ID = TRACKING['ga4MeasurementId']
if MEASUREMENT_ID is not None and not re.fullmatch(r'G-[A-Z0-9]{6,}', MEASUREMENT_ID):
    raise ValueError('Use the actual GA4 web-stream measurement ID, or null while setup is pending')


def analytics_markup(page):
    page = re.sub(r'\n?<!-- ANALYTICS:START -->.*?<!-- ANALYTICS:END -->\n?', '\n', page, flags=re.S)
    if MEASUREMENT_ID is None:
        return page
    script_version = hashlib.sha256((ROOT / 'assets/site-analytics.js').read_bytes()).hexdigest()[:12]
    css_version = hashlib.sha256((ROOT / 'styles/analytics.css').read_bytes()).hexdigest()[:12]
    markup = f'''<!-- ANALYTICS:START -->
  <link rel="stylesheet" href="/styles/analytics.css?v={css_version}" />
  <script src="/assets/site-analytics.js?v={script_version}" data-measurement-id="{MEASUREMENT_ID}" defer></script>
<!-- ANALYTICS:END -->
'''
    return page.replace('</head>', markup + '</head>', 1)


service_paths = {'/services/' + offer['slug'] + '/' for offer in SERVICES}
if any(item['from'] in service_paths or item['to'] not in service_paths for item in REDIRECTS):
    raise ValueError('Legacy service URLs must redirect directly to an active service')


def service_schema(offer):
    url = SITE + 'services/' + offer['slug'] + '/'
    return {'@type': 'Service', '@id': url + '#service', 'url': url, 'name': offer['name'], 'serviceType': offer['name'], 'description': offer['description'], 'areaServed': 'Worldwide', 'provider': {'@id': SITE + '#organization'}}


def publisher_logo():
    svg = ET.fromstring((ROOT / 'images/brand/rubix/solvero-header.svg').read_text())
    _, _, artwork_width, artwork_height = map(float, svg.attrib['viewBox'].split())
    width = 1024
    height = math.ceil(width * artwork_height / artwork_width)
    svg.set('width', str(width))
    svg.set('height', str(height))
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    path = 'images/brand/rubix/solvero-publisher.svg'
    (ROOT / path).write_text(ET.tostring(svg, encoding='unicode') + '\n')
    return {'@type': 'ImageObject', 'url': SITE + path, 'width': width, 'height': height}


def homepage_services():
    cards = []
    for offer in SERVICES:
        if len(offer['cardPoints']) != 3 or any(not isinstance(point, str) or not point.strip() for point in offer['cardPoints']):
            raise ValueError(f"{offer['slug']}: each homepage offer must have three non-empty points")
        points = '\n'.join(f'''<li class="flex items-start gap-2"><svg class="w-4 h-4 shrink-0 mt-0.5 text-brand-primary-dark" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4L19 6" /></svg><span>{html.escape(point)}</span></li>''' for point in offer['cardPoints'])
        cards.append(f'''<div class="service-card bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-left">
          <div class="service-card-icon service-card-icon--{html.escape(offer['colour'])} flex items-center justify-center w-16 h-16 mb-6"><img src="{html.escape(offer['icon'])}" alt="" aria-hidden="true" width="{offer['iconSize']}" height="{offer['iconSize']}" decoding="async" /></div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">{html.escape(offer['cardHeading'])}</h3>
          <p class="service-card-description text-left text-gray-600 mb-6">{html.escape(offer['cardDescription'])}</p>
          <div class="service-card-examples border-t border-gray-200 pt-6 mb-6">
            <ul role="list" class="space-y-2 text-left text-sm leading-relaxed text-gray-700">{points}</ul>
            <p class="mt-3 pl-6 text-left text-sm text-gray-600">and more</p>
          </div>
          <p class="text-sm leading-relaxed text-center"><a class="text-brand-primary underline font-semibold" href="/services/{offer['slug']}/">{html.escape(offer['cardCta'])}</a></p>
        </div>''')
    return f'''<section class="py-16 md:py-24 bg-white" id="services">
    <div class="container mx-auto px-6">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 md:mb-12">How we can help your business</h2>
      <div class="service-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{''.join(cards)}</div>
    </div>
  </section>'''


spec = importlib.util.spec_from_file_location('renderer', ROOT / 'tools/content-renderer.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
layout_spec = importlib.util.spec_from_file_location('editorial_layout', ROOT / 'tools/editorial-layout.py')
layout = importlib.util.module_from_spec(layout_spec)
layout_spec.loader.exec_module(layout)
renderer.LINKS = {a['file'] + '.md': '/blog/' + a['slug'] + '/' for a in META}
renderer.LINKS['author-jateen-narsai.md'] = '/authors/jateen-narsai/'
renderer.IMAGE_SIZES = {image['src']: (image['width'], image['height']) for a in META for image in a.get('images', [])}
renderer.IMAGE_META = {image['src']: image for a in META for image in a.get('images', [])}
template = (ROOT / '_templates/editorial.html').read_text()
homepage = (ROOT / 'index.html').read_text()
graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', homepage, re.S)[1])['@graph']
next(node for node in graph if node['@type'] == 'Organization')['logo'] = publisher_logo()
# The homepage cards, detailed pages and catalogue share the same three offers.
graph = [node for node in graph if node['@type'] not in ('Service', 'OfferCatalog')]
next(node for node in graph if node['@type'] == 'WebPage')['mainEntity'] = {'@id': SITE + '#services'}
graph += [service_schema(offer) for offer in SERVICES]
graph.append({'@type': 'OfferCatalog', '@id': SITE + '#services', 'name': 'Solvero services', 'itemListElement': [
    {'@type': 'Offer', 'itemOffered': {'@id': service_schema(offer)['@id']}} for offer in SERVICES]})
home_schema = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2).replace('</', '<\\/')
homepage = re.sub(r'(<script type="application/ld\+json">).*?(</script>)', lambda match: match[1] + '\n' + home_schema + '\n  ' + match[2], homepage, count=1, flags=re.S)
homepage, replacements = re.subn(r'<section\b[^>]*\bid="services"[^>]*>.*?</section>', lambda _: homepage_services(), homepage, count=1, flags=re.S)
if replacements != 1:
    raise ValueError('The homepage must contain one services section')
(ROOT / 'index.html').write_text(analytics_markup(homepage))
shared = [copy.deepcopy(n) for n in graph if n['@type'] in ('Organization', 'WebSite')]
person = {'@type': 'Person', '@id': AUTHOR['canonical'] + '#person', 'name': AUTHOR['name'], 'url': AUTHOR['canonical'], 'description': AUTHOR['biography'], 'sameAs': [AUTHOR['linkedin']]}


def breadcrumbs(url, title, article=False):
    items = [('Home', SITE)]
    if article:
        items.append(('Blog', SITE + 'blog/'))
    items.append((title, url))
    return {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': name, 'item': link}
        for i, (name, link) in enumerate(items, 1)]}


def hero(title, subtitle):
    return f'''<header class="editorial-hero bg-white text-gray-800">
      <div class="container mx-auto px-6 max-w-4xl">
        <a class="article-blog-link" href="/blog/">Solvero Blog</a>
        <h1 class="font-semibold mb-6">{html.escape(title)}</h1>
        <p class="text-lg leading-relaxed">{subtitle}</p>
      </div></header>'''


def date_label(value):
    return layout.date_label(value)


def write_page(relative, title, description, url, nodes, main, extra_head='', image=None, page_template=None):
    schema = json.dumps({'@context': 'https://schema.org', '@graph': shared + nodes}, ensure_ascii=False, indent=2).replace('</', '<\\/')
    values = {'TITLE': html.escape(title), 'DESCRIPTION': html.escape(description, quote=True), 'URL': url, 'SCHEMA': schema, 'MAIN': main, 'EXTRA_HEAD': extra_head, 'EDITORIAL_VERSION': hashlib.sha256((ROOT / 'styles/editorial.css').read_bytes()).hexdigest()[:12]}
    values.update({'IMAGE_URL': image['url'] if image else SITE + 'images/brand/rubix/solvero-social.png', 'IMAGE_ALT': html.escape(image['alt'], quote=True) if image else 'Solvero logo', 'TWITTER_CARD': 'summary_large_image' if image else 'summary'})
    page = page_template if page_template is not None else template
    for key, value in values.items():
        page = page.replace('{{' + key + '}}', value)
    if any(n['@type'] == 'BlogPosting' for n in nodes):
        page = page.replace('property="og:type" content="website"', 'property="og:type" content="article"')
    file = ROOT / relative
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(analytics_markup(page))


def service_main(offer):
    esc = html.escape
    name = esc(offer['name'])
    def cards(items, tag='article'):
        return ''.join(f'<{tag} class="bg-white rounded-lg p-8"><h3 class="text-2xl font-semibold mb-4">{esc(heading)}</h3><p class="text-gray-700">{esc(text)}</p></{tag}>' for heading, text in items)
    outputs = cards(offer['outputs'])
    steps = ''.join(f'<li><span class="text-brand-primary font-bold" aria-hidden="true">{i:02}</span><h3 class="text-xl font-bold mt-2 mb-4">{esc(heading)}</h3><p class="text-gray-700">{esc(text)}</p></li>' for i, (heading, text) in enumerate(offer['steps'], 1))
    questions = ''.join(f'<details class="faq-item"><summary>{esc(question)}</summary><p>{esc(answer)}</p></details>' for question, answer in offer['questions'])
    questions += '<details class="faq-item"><summary>Can you work with our team internationally?</summary><p>Yes. We are based in Johannesburg and work remotely with English-speaking businesses internationally. We agree working times, decision-makers and a shared place for documents, then plan access, testing and handover around the engagement.</p></details>'
    guides = ''.join(f'<li><a class="text-brand-primary underline" href="/blog/{slug}/">{esc(label)}</a></li>' for slug, label in offer['guides'])
    related = ''.join(f'<li><a class="text-brand-primary underline" href="/services/{item["slug"]}/">{esc(item["name"])}</a></li>' for item in SERVICES if item['slug'] != offer['slug'])
    examples = ''
    if offer.get('useCases'):
        cases = []
        for case in offer['useCases']:
            guide = f' <a class="text-brand-primary underline" href="/blog/{case["guide"]}/">{esc(case["guideLabel"])}</a>.' if 'guide' in case else ''
            cases.append(f'<article class="bg-white rounded-lg p-8"><h3 class="text-2xl font-semibold mb-4">{esc(case["heading"])}</h3><p class="text-gray-700">{esc(case["text"])}{guide}</p></article>')
        examples = f'<section class="py-16 md:py-20 bg-gray-100" id="examples"><div class="container mx-auto px-6 max-w-6xl"><h2 class="text-3xl font-bold mb-4">{esc(offer["useCasesHeading"])}</h2><p class="text-gray-700 text-lg max-w-3xl mb-10">{esc(offer["useCasesIntro"])}</p><div class="grid grid-cols-1 md:grid-cols-2 gap-8">' + ''.join(cases) + '</div></div></section>'
    support = ''
    if offer.get('support'):
        item = offer['support']
        support = f'<h3 id="{esc(item["id"])}" class="text-2xl font-semibold mt-10 mb-4 scroll-mt-32">{esc(item["heading"])}</h3><p class="text-lg text-gray-700">{esc(item["text"])}</p>'
    return f'''<header class="bg-brand-gradient text-white py-14 md:py-20">
      <div class="container mx-auto px-6 max-w-6xl">
        <nav aria-label="Breadcrumb" class="mb-8 text-sm" style="height:auto"><ol class="flex flex-wrap gap-3"><li><a class="underline underline-offset-4" href="/">Home</a></li><li><span aria-hidden="true">/</span> <span aria-current="page">{name}</span></li></ol></nav>
        <p class="text-lg font-semibold mb-4">{name}</p><h1 class="text-4xl md:text-5xl font-semibold leading-tight max-w-4xl mb-6">{esc(offer['headline'])}</h1>
        <p class="text-lg md:text-xl leading-relaxed max-w-3xl mb-8">{esc(offer['intro'])}</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md hover:bg-gray-100" href="/#contact">{esc(offer['cta'])}</a>
      </div></header>
    <section class="py-16 md:py-20 bg-white"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">{esc(offer['problemHeading'])}</h2><p class="text-lg text-gray-700 mb-6">{esc(offer['problem'])}</p><p class="text-lg text-gray-700">{esc(offer['investigation'])}</p></div></section>
{examples}
    <section class="py-16 md:py-20 bg-gray-100" id="deliverables"><div class="container mx-auto px-6 max-w-6xl"><h2 class="text-3xl font-bold mb-10">{esc(offer['outputsHeading'])}</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8">{outputs}</div></div></section>
    <section class="py-16 md:py-20 bg-white" id="delivery"><div class="container mx-auto px-6 max-w-6xl"><h2 class="text-3xl font-bold mb-10">How we work with your team.</h2><ol class="grid grid-cols-1 md:grid-cols-3 gap-8">{steps}</ol></div></section>
    <section class="py-16 md:py-20 bg-gray-100"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">{esc(offer['exampleHeading'])}</h2><p class="text-lg text-gray-700 mb-6">{esc(offer['examples'])}</p><p class="text-lg text-gray-700">{esc(offer['scope'])}</p>{support}</div></section>
    <section class="py-16 md:py-20 bg-white" id="questions"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-8">Plan the work with confidence.</h2><div class="space-y-4">{questions}</div></div></section>
    <section class="py-16 md:py-20 bg-gray-100"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">Practical guides for planning your next step.</h2><ul class="space-y-4">{guides}</ul><h3 class="text-xl font-semibold mt-10 mb-4">Related services</h3><ul class="space-y-4">{related}</ul></div></section>
    <section class="py-16 md:py-20 bg-brand-gradient text-white"><div class="container mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl md:text-4xl font-bold mb-5">{esc(offer['closingHeading'])}</h2><p class="text-lg mb-8">{esc(offer['closingIntro'])}</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md hover:bg-gray-100" href="/#contact">{esc(offer['cta'])}</a><p class="mt-6">Or email <a class="underline underline-offset-4 break-all" href="mailto:solutions@solvero.co.za">solutions@solvero.co.za</a>.</p></div></section>'''


service_template = (ROOT / '_templates/service.html').read_text()
for offer in SERVICES:
    service_url = SITE + 'services/' + offer['slug'] + '/'
    service_page = {'@type': 'WebPage', '@id': service_url + '#webpage', 'url': service_url, 'name': offer['title'], 'description': offer['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': service_url + '#service'}, 'breadcrumb': {'@id': service_url + '#breadcrumb'}}
    service = service_schema(offer)
    write_page('services/' + offer['slug'] + '/index.html', offer['title'], offer['description'], service_url, [service_page, service, breadcrumbs(service_url, offer['name'])], service_main(offer), page_template=service_template)

# GitHub Pages serves static files: instant refreshes keep previous URLs useful.
for redirect in REDIRECTS:
    target = html.escape(redirect['to'], quote=True)
    target_offer = next(offer for offer in SERVICES if '/services/' + offer['slug'] + '/' == redirect['to'])
    target_name = html.escape(target_offer['name'])
    retired = ROOT / (redirect['from'].lstrip('/') + 'index.html')
    retired.parent.mkdir(parents=True, exist_ok=True)
    retired.write_text(f'''<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Service page has moved | Solvero</title>
  <meta http-equiv="refresh" content="0; url={target}" />
  <link rel="canonical" href="{SITE.rstrip('/')}{target}" />
</head><body>
  <main><h1>This service is now covered by {target_name}.</h1>
  <p><a href="{target}">Continue to {target_name}</a>.</p></main>
</body></html>
''')


article_navigation_version = hashlib.sha256((ROOT / 'assets/article-navigation.js').read_bytes()).hexdigest()[:12]
for a in META:
    url = a['canonical']
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': a['title'], 'description': a['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': url + '#article'}}
    post = {'@type': 'BlogPosting', '@id': url + '#article', 'url': url, 'headline': a['headline'], 'description': a['description'], 'inLanguage': 'en', 'articleSection': a['section'], 'author': {'@id': person['@id']}, 'publisher': {'@id': SITE + '#organization'}, 'mainEntityOfPage': {'@id': page['@id']}, 'isPartOf': {'@id': SITE + '#website'}, 'datePublished': a['datePublished'], 'dateModified': a['dateModified']}
    if 'image' in a:
        lead_image = next(image for image in a['images'] if SITE.rstrip('/') + image['src'] == a['image'])
        post['image'] = {'@type': 'ImageObject', 'url': a['image'], 'width': lead_image['width'], 'height': lead_image['height'], 'description': a['image_alt']}
    markdown = (CONTENT / 'blog' / (a['file'] + '.md')).read_text()
    main = layout.article_main(a, {'name': AUTHOR['name'], 'url': '/authors/jateen-narsai/'}, markdown, renderer)
    extra = f'<meta name="author" content="{html.escape(AUTHOR["name"])}" /><meta property="article:published_time" content="{a["datePublished"]}" /><meta property="article:modified_time" content="{a["dateModified"]}" /><script src="/assets/article-navigation.js?v={article_navigation_version}" defer></script>'
    if 'image' in a:
        extra += f'<meta property="og:image:width" content="{lead_image["width"]}" /><meta property="og:image:height" content="{lead_image["height"]}" />'
    write_page('blog/' + a['slug'] + '/index.html', a['title'], a['description'], url, [person, page, post], main, extra, image={'url': a['image'], 'alt': a['image_alt']} if 'image' in a else None)

url = AUTHOR['canonical']
profile = {'@type': 'ProfilePage', '@id': url + '#webpage', 'url': url, 'name': AUTHOR['name'] + ' | Solvero', 'description': AUTHOR['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': person['@id']}, 'publisher': {'@id': SITE + '#organization'}}
body = (CONTENT / 'author-jateen-narsai.md').read_text().split('\n', 1)[1]
profile_body = renderer.render(body)
linkedin_paragraph = f'<p><a href="{html.escape(AUTHOR["linkedin"], quote=True)}">View Jateen’s LinkedIn profile</a>.</p>'
assert profile_body.count(linkedin_paragraph) == 1, 'Author profile must contain one LinkedIn profile link'
linkedin_label = html.escape(f'View {AUTHOR["name"]}’s LinkedIn profile (opens in a new tab)', quote=True)
linkedin_icon = f'<p class="author-social"><a class="author-linkedin" href="{html.escape(AUTHOR["linkedin"], quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{linkedin_label}" title="{linkedin_label}"><img src="/images/social/linkedin-in.svg" width="24" height="24" alt="" /></a></p>'
profile_body = profile_body.replace(linkedin_paragraph, linkedin_icon)
profile_header = f'<header class="editorial-hero author-hero bg-white text-gray-800"><div class="container mx-auto px-6 max-w-4xl"><a class="article-blog-link" href="/blog/">Solvero Blog</a><h1 class="font-semibold">{html.escape(AUTHOR["name"])}</h1></div></header>'
main = profile_header + '<div class="author-profile-content bg-white"><div class="article-body mx-auto px-6 max-w-4xl">' + profile_body + '</div></div>'
write_page('authors/jateen-narsai/index.html', profile['name'], AUTHOR['description'], url, [person, profile], main)

url = SITE + 'blog/'
title = 'Business & Technology Blog | Solvero'
description = 'Ideas, insights and practical guides on business and technology, from improving operations and connecting systems to assessing new tools and approaches.'
collection = {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'publisher': {'@id': SITE + '#organization'}, 'mainEntity': {'@id': url + '#articles'}}
# Publication date controls the archive order; existing order breaks same-day ties.
archive = sorted(META, key=lambda article: datetime.fromisoformat(article['datePublished']).date(), reverse=True)
listing = {'@type': 'ItemList', '@id': url + '#articles', 'numberOfItems': len(archive), 'itemListOrder': 'https://schema.org/ItemListOrderDescending', 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': a['headline'], 'url': a['canonical']} for i, a in enumerate(archive, 1)]}


def archive_card(article, position):
    image = next(image for image in article['images'] if SITE.rstrip('/') + image['src'] == article['image'])
    thumb = article['thumbnail']
    variants = thumb['variants']
    responsive = ''
    if variants:
        responsive = ' srcset="' + ', '.join(f'{variant["src"]} {variant["width"]}w' for variant in variants) + '" sizes="(min-width: 1200px) 363px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 80px) / 2), calc(100vw - 48px)"'
    loading = 'eager' if position < 3 else 'lazy'
    updated = article['dateModified'] > article['datePublished']
    visible_date = article['dateModified'] if updated else article['datePublished']
    date_kind = 'Updated' if updated else 'Published'
    return f'''<article class="blog-card" data-blog-card data-topic="{html.escape(article['section'], quote=True)}">
      <a class="blog-card-link" href="/blog/{article['slug']}/" aria-labelledby="card-title-{article['slug']}">
      <div class="blog-card-image"><img src="{thumb['src']}"{responsive} alt="{html.escape(article['image_alt'], quote=True)}" width="{thumb['width']}" height="{thumb['height']}" loading="{loading}" decoding="async" /></div>
      <div class="blog-card-copy"><p class="blog-card-date">{date_kind}: <time datetime="{visible_date}">{date_label(visible_date)}</time></p><p class="blog-card-topic">{html.escape(article['section'])}</p>
      <h3 id="card-title-{article['slug']}">{html.escape(article['headline'])}</h3>
      <p class="blog-card-description">{html.escape(article['description'])}</p>
      <span class="blog-card-read-more" aria-hidden="true">Read more <svg class="blog-card-arrow" aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7" /></svg></span></div>
      </a>
    </article>'''


cards = ''.join(archive_card(article, position) for position, article in enumerate(archive))
topics = list(dict.fromkeys(article['section'] for article in META))
topic_buttons = '<button type="button" class="blog-filter" data-blog-filter data-topic="" aria-pressed="true" aria-controls="articles-grid">All</button>'
topic_buttons += ''.join(f'<button type="button" class="blog-filter" data-blog-filter data-topic="{html.escape(topic, quote=True)}" aria-pressed="false" aria-controls="articles-grid">{html.escape(topic)}</button>' for topic in topics)
main = f'''<header class="editorial-hero blog-index-hero bg-brand-gradient text-white"><div class="container mx-auto px-6 max-w-6xl">
  <h1 class="font-semibold mb-3">Solvero Blog</h1><p>Ideas, insights and updates on business and technology.</p>
</div></header><section class="blog-index-content bg-white" aria-labelledby="articles-heading"><div class="container mx-auto px-6 max-w-6xl">
  <h2 id="articles-heading" class="sr-only">Articles and practical guides</h2>
  <div class="blog-filters" data-blog-filters role="group" aria-label="Filter articles by topic" hidden><span class="blog-filter-label" aria-hidden="true">Topics</span>{topic_buttons}</div>
  <p class="blog-results" data-blog-results role="status" aria-live="polite" aria-atomic="true">{len(archive)} articles · Newest first</p>
  <div class="blog-grid" id="articles-grid">{cards}</div>
</div></section>''' + '''<section class="bg-brand-gradient text-white py-16"><div class="mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl font-bold mb-5">What would you like your business to do better?</h2><p class="text-lg mb-8">We help you <a class="underline" href="/services/business-operations-improvement/">improve business operations</a>, <a class="underline" href="/services/new-business-capabilities/">deliver new capabilities</a> and <a class="underline" href="/services/delivery-team-effectiveness/">strengthen delivery teams</a>. Tell us the result you want and we can agree a practical starting point.</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md" href="/#contact">Let’s discuss what we can optimise</a></div></section>'''
filter_version = hashlib.sha256((ROOT / 'assets/blog-filters.js').read_bytes()).hexdigest()[:12]
write_page('blog/index.html', title, description, url, [collection, listing], main, extra_head=f'<script src="/assets/blog-filters.js?v={filter_version}" defer></script>')
urls = [SITE] + [SITE + 'services/' + offer['slug'] + '/' for offer in SERVICES] + [url] + [a['canonical'] for a in META] + [AUTHOR['canonical']]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + u + '</loc></url>\n' for u in urls) + '</urlset>\n')
print(f'Generated {len(SERVICES)} offer pages, {len(META)} articles, the biography, blog index and {len(urls)}-page sitemap.')
