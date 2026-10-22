"""Generate the published blog and biography; committed HTML is served by Pages."""
from pathlib import Path
import copy
import hashlib
import html
import importlib.util
import json
import re
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / '_content'
SITE = 'https://solvero.co.za/'
META = json.loads((CONTENT / 'blog/metadata.json').read_text())
AUTHOR = json.loads((CONTENT / 'author.json').read_text())
SERVICES = json.loads((CONTENT / 'services.json').read_text())
REDIRECTS = json.loads((CONTENT / 'service-redirects.json').read_text())
service_paths = {'/services/' + offer['slug'] + '/' for offer in SERVICES}
if any(item['from'] in service_paths or item['to'] not in service_paths for item in REDIRECTS):
    raise ValueError('Legacy service URLs must redirect directly to an active service')


def service_schema(offer):
    url = SITE + 'services/' + offer['slug'] + '/'
    return {'@type': 'Service', '@id': url + '#service', 'url': url, 'name': offer['name'], 'serviceType': offer['name'], 'description': offer['description'], 'areaServed': 'Worldwide', 'provider': {'@id': SITE + '#organization'}}


def homepage_services():
    cards = ''.join(f'''<div class="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col">
          <div class="flex items-center justify-center bg-brand-{offer['colour']} text-white rounded-full w-16 h-16 mb-6 mx-auto"><span class="material-icons text-3xl" aria-hidden="true">{html.escape(offer['icon'])}</span></div>
          <h3 class="text-2xl font-semibold text-gray-800 mb-3">{html.escape(offer['cardHeading'])}</h3>
          <p class="text-gray-600 mb-6">{html.escape(offer['cardDescription'])}</p>
          <p class="mt-auto"><a class="text-brand-primary underline font-semibold" href="/services/{offer['slug']}/">{html.escape(offer['cardCta'])}</a></p>
        </div>''' for offer in SERVICES)
    return f'''<section class="py-16 md:py-24 bg-white" id="services">
    <div class="container mx-auto px-6">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Business improvement and solution delivery</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{cards}</div>
    </div>
  </section>'''


spec = importlib.util.spec_from_file_location('renderer', ROOT / 'tools/content-renderer.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
renderer.LINKS = {a['file'] + '.md': '/blog/' + a['slug'] + '/' for a in META}
renderer.LINKS['author-jateen-narsai.md'] = '/authors/jateen-narsai/'
renderer.IMAGE_SIZES = {image['src']: (image['width'], image['height']) for a in META for image in a.get('images', [])}
renderer.IMAGE_META = {image['src']: image for a in META for image in a.get('images', [])}
template = (ROOT / '_templates/editorial.html').read_text()
homepage = (ROOT / 'index.html').read_text()
graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', homepage, re.S)[1])['@graph']
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
(ROOT / 'index.html').write_text(homepage)
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


def hero(title, subtitle, article=False, trail_label=None):
    trail = '<a class="underline underline-offset-4" href="/">Home</a> <span aria-hidden="true">/</span> '
    if article:
        trail += '<a class="underline underline-offset-4" href="/blog/">Blog</a> <span aria-hidden="true">/</span> '
    trail += '<span aria-current="page">' + ('Article' if article else html.escape(trail_label or title)) + '</span>'
    return f'''<header class="editorial-hero bg-brand-gradient text-white">
      <div class="container mx-auto px-6 max-w-4xl">
        <nav aria-label="Breadcrumb" class="mb-8 text-sm" style="height:auto">{trail}</nav>
        <h1 class="font-semibold mb-6">{html.escape(title)}</h1>
        <p class="text-lg leading-relaxed">{subtitle}</p>
      </div></header>'''


def date_label(value):
    parsed = date.fromisoformat(value)
    return f'{parsed.day} {parsed.strftime("%B %Y")}'


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
    file.write_text(page)


def service_main(offer):
    esc = html.escape
    name = esc(offer['name'])
    def cards(items, tag='article'):
        return ''.join(f'<{tag} class="bg-white rounded-lg p-8"><h3 class="text-2xl font-semibold mb-4">{esc(heading)}</h3><p class="text-gray-700">{esc(text)}</p></{tag}>' for heading, text in items)
    outputs = cards(offer['outputs'])
    steps = ''.join(f'<li><span class="text-brand-primary font-bold" aria-hidden="true">{i:02}</span><h3 class="text-xl font-bold mt-2 mb-4">{esc(heading)}</h3><p class="text-gray-700">{esc(text)}</p></li>' for i, (heading, text) in enumerate(offer['steps'], 1))
    questions = ''.join(f'<details class="faq-item"><summary>{esc(question)}</summary><p>{esc(answer)}</p></details>' for question, answer in offer['questions'])
    questions += '<details class="faq-item"><summary>Can you work with our team internationally?</summary><p>Yes. We are based in Johannesburg and work remotely with English-speaking businesses internationally. We agree meeting times, a shared place for working documents and the people who can make decisions. Discovery uses recent examples and walkthroughs with your team. Access, testing, acceptance and handover are agreed for the scope.</p></details>'
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
    <section class="py-16 md:py-20 bg-gray-100"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">Explore the problem before we talk.</h2><ul class="space-y-4">{guides}</ul><h3 class="text-xl font-semibold mt-10 mb-4">Related services</h3><ul class="space-y-4">{related}</ul></div></section>
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


for a in META:
    url = a['canonical']
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': a['title'], 'description': a['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': url + '#article'}, 'breadcrumb': {'@id': url + '#breadcrumb'}}
    post = {'@type': 'BlogPosting', '@id': url + '#article', 'url': url, 'headline': a['headline'], 'description': a['description'], 'inLanguage': 'en', 'articleSection': a['section'], 'author': {'@id': person['@id']}, 'publisher': {'@id': SITE + '#organization'}, 'mainEntityOfPage': {'@id': page['@id']}, 'isPartOf': {'@id': SITE + '#website'}, 'datePublished': a['datePublished'], 'dateModified': a['dateModified']}
    if 'image' in a:
        lead_image = next(image for image in a['images'] if SITE.rstrip('/') + image['src'] == a['image'])
        post['image'] = {'@type': 'ImageObject', 'url': a['image'], 'width': lead_image['width'], 'height': lead_image['height'], 'caption': a['image_alt']}
    markdown = (CONTENT / 'blog' / (a['file'] + '.md')).read_text()
    # The title and byline are displayed in the site's branded article header.
    body = re.sub(r'^# .*?\n\nBy .*?\n\n', '', markdown, count=1)
    subtitle = f'{html.escape(a["section"])} · By <a class="underline underline-offset-4" rel="author" href="/authors/jateen-narsai/">{html.escape(AUTHOR["name"])}</a> · Published <time datetime="{a["datePublished"]}">{date_label(a["datePublished"])}</time>'
    main = '<article>' + hero(a['headline'], subtitle, True) + '<div class="bg-white py-12 md:py-16"><div class="article-body mx-auto px-6 max-w-4xl">' + renderer.render(body) + '</div></div></article>'
    extra = f'<meta name="author" content="{html.escape(AUTHOR["name"])}" /><meta property="article:published_time" content="{a["datePublished"]}" /><meta property="article:modified_time" content="{a["dateModified"]}" />'
    if 'image' in a:
        extra += f'<meta property="og:image:width" content="{lead_image["width"]}" /><meta property="og:image:height" content="{lead_image["height"]}" />'
    write_page('blog/' + a['slug'] + '/index.html', a['title'], a['description'], url, [person, page, post, breadcrumbs(url, a['headline'], True)], main, extra, image={'url': a['image'], 'alt': a['image_alt']} if 'image' in a else None)

url = AUTHOR['canonical']
profile = {'@type': 'ProfilePage', '@id': url + '#webpage', 'url': url, 'name': AUTHOR['name'] + ' | Solvero', 'description': AUTHOR['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': person['@id']}, 'publisher': {'@id': SITE + '#organization'}, 'breadcrumb': {'@id': url + '#breadcrumb'}}
body = (CONTENT / 'author-jateen-narsai.md').read_text().split('\n', 1)[1]
main = hero(AUTHOR['name'], 'Business and systems analysis · Process improvement · Software solution design') + '<div class="bg-white py-12 md:py-16"><div class="article-body mx-auto px-6 max-w-4xl">' + renderer.render(body) + '</div></div>'
write_page('authors/jateen-narsai/index.html', profile['name'], AUTHOR['description'], url, [person, profile, breadcrumbs(url, AUTHOR['name'])], main)

url = SITE + 'blog/'
title = 'Business Improvement & Solution Delivery Guides | Solvero'
description = 'Practical guides to finding bottlenecks, improving business processes and delivering useful solutions, with examples and worksheets to help plan the work.'
collection = {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'publisher': {'@id': SITE + '#organization'}, 'breadcrumb': {'@id': url + '#breadcrumb'}, 'mainEntity': {'@id': url + '#articles'}}
# Publication date controls the archive order; existing order breaks same-day ties.
archive = sorted(META, key=lambda article: date.fromisoformat(article['datePublished']), reverse=True)
listing = {'@type': 'ItemList', '@id': url + '#articles', 'numberOfItems': len(archive), 'itemListOrder': 'https://schema.org/ItemListOrderDescending', 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': a['headline'], 'url': a['canonical']} for i, a in enumerate(archive, 1)]}


def archive_card(article, position):
    image = next(image for image in article['images'] if SITE.rstrip('/') + image['src'] == article['image'])
    thumb = article['thumbnail']
    variants = thumb['variants']
    responsive = ''
    if variants:
        responsive = ' srcset="' + ', '.join(f'{variant["src"]} {variant["width"]}w' for variant in variants) + '" sizes="(min-width: 1200px) 363px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 80px) / 2), calc(100vw - 48px)"'
    search_text = html.escape(' '.join(article[key] for key in ['headline', 'description', 'section', 'query']), quote=True)
    loading = 'eager' if position < 3 else 'lazy'
    return f'''<article class="blog-card" data-blog-card data-search-text="{search_text}">
      <a class="blog-card-image" href="/blog/{article['slug']}/" tabindex="-1" aria-hidden="true"><img src="{thumb['src']}"{responsive} alt="{html.escape(article['image_alt'], quote=True)}" width="{thumb['width']}" height="{thumb['height']}" loading="{loading}" decoding="async" /></a>
      <div class="blog-card-copy"><p class="blog-card-topic">{html.escape(article['section'])}</p>
      <h3><a href="/blog/{article['slug']}/">{html.escape(article['headline'])}</a></h3>
      <p class="blog-card-description">{html.escape(article['description'])}</p>
      <p class="blog-card-meta"><time datetime="{article['datePublished']}">{date_label(article['datePublished'])}</time><span aria-hidden="true"> · </span>By <a rel="author" href="/authors/jateen-narsai/">{html.escape(AUTHOR['name'])}</a></p></div>
    </article>'''


cards = ''.join(archive_card(article, position) for position, article in enumerate(archive))
main = hero('Make work easier and get useful changes delivered.', 'Practical guides to finding bottlenecks, improving processes and delivering solutions across people and systems.', trail_label='Blog') + f'''<section class="bg-white py-16" aria-labelledby="articles-heading"><div class="container mx-auto px-6 max-w-6xl">
  <div class="blog-index-heading"><h2 id="articles-heading" class="text-3xl font-bold text-gray-800">Latest articles and practical guides</h2></div>
  <form class="blog-search" role="search" data-blog-search hidden>
    <label for="blog-search-input">Search articles</label><div class="blog-search-field">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
    <input id="blog-search-input" type="search" name="q" placeholder="Try automation or bottlenecks" aria-controls="articles-grid" aria-describedby="blog-search-help" autocomplete="off" />
    <button type="button" class="blog-search-clear" data-search-clear hidden>Clear</button></div>
    <p id="blog-search-help">Search titles, descriptions and topics.</p>
  </form>
  <p class="blog-results" data-blog-results role="status" aria-live="polite" aria-atomic="true">{len(archive)} articles · Newest first</p>
  <div class="blog-grid" id="articles-grid">{cards}</div>
  <div class="blog-empty" data-blog-empty hidden><h3>No matching articles</h3><p>Try a broader term, such as process, data or automation, or clear your search.</p></div>
</div></section>''' + '''<section class="bg-brand-gradient text-white py-16"><div class="mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl font-bold mb-5">What would you like your business to do better?</h2><p class="text-lg mb-8">We help you <a class="underline" href="/services/business-operations-improvement/">improve business operations</a>, <a class="underline" href="/services/new-business-capabilities/">deliver new capabilities</a> and <a class="underline" href="/services/delivery-team-effectiveness/">strengthen delivery teams</a>. Tell us the result you want and we can agree a practical starting point.</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md" href="/#contact">Discuss what you want to achieve</a></div></section>'''
search_version = hashlib.sha256((ROOT / 'assets/blog-search.js').read_bytes()).hexdigest()[:12]
write_page('blog/index.html', title, description, url, [collection, listing, breadcrumbs(url, 'Blog')], main, extra_head=f'<script src="/assets/blog-search.js?v={search_version}" defer></script>')
urls = [SITE] + [SITE + 'services/' + offer['slug'] + '/' for offer in SERVICES] + [url] + [a['canonical'] for a in META] + [AUTHOR['canonical']]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + u + '</loc></url>\n' for u in urls) + '</urlset>\n')
print(f'Generated {len(SERVICES)} offer pages, {len(META)} articles, the biography, blog index and {len(urls)}-page sitemap.')
