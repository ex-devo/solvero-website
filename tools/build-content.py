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
    values.update({'IMAGE_URL': image['url'] if image else SITE + 'images/brand/solvero-social.png', 'IMAGE_ALT': html.escape(image['alt'], quote=True) if image else 'Solvero logo', 'TWITTER_CARD': 'summary_large_image' if image else 'summary'})
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
    return f'''<header class="bg-brand-gradient text-white py-14 md:py-20">
      <div class="container mx-auto px-6 max-w-6xl">
        <nav aria-label="Breadcrumb" class="mb-8 text-sm" style="height:auto"><ol class="flex flex-wrap gap-3"><li><a class="underline underline-offset-4" href="/">Home</a></li><li><span aria-hidden="true">/</span> <span aria-current="page">{name}</span></li></ol></nav>
        <p class="text-lg font-semibold mb-4">{name}</p><h1 class="text-4xl md:text-5xl font-semibold leading-tight max-w-4xl mb-6">{esc(offer['headline'])}</h1>
        <p class="text-lg md:text-xl leading-relaxed max-w-3xl mb-8">{esc(offer['intro'])}</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md hover:bg-gray-100" href="/#contact">{esc(offer['cta'])}</a>
      </div></header>
    <section class="py-16 md:py-20 bg-white"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">{esc(offer['problemHeading'])}</h2><p class="text-lg text-gray-700 mb-6">{esc(offer['problem'])}</p><p class="text-lg text-gray-700">{esc(offer['investigation'])}</p></div></section>
    <section class="py-16 md:py-20 bg-gray-100" id="deliverables"><div class="container mx-auto px-6 max-w-6xl"><h2 class="text-3xl font-bold mb-10">{esc(offer['outputsHeading'])}</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8">{outputs}</div></div></section>
    <section class="py-16 md:py-20 bg-white" id="delivery"><div class="container mx-auto px-6 max-w-6xl"><h2 class="text-3xl font-bold mb-10">How we work with your team.</h2><ol class="grid grid-cols-1 md:grid-cols-3 gap-8">{steps}</ol></div></section>
    <section class="py-16 md:py-20 bg-gray-100"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">{esc(offer['exampleHeading'])}</h2><p class="text-lg text-gray-700 mb-6">{esc(offer['examples'])}</p><p class="text-lg text-gray-700">{esc(offer['scope'])}</p><p class="text-gray-700 mt-6">For suitable technical changes, explore our <a class="text-brand-primary underline" href="/services/workflow-automation/">business process automation and integration service</a>.</p></div></section>
    <section class="py-16 md:py-20 bg-white" id="questions"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-8">Plan the work with confidence.</h2><div class="space-y-4">{questions}</div></div></section>
    <section class="py-16 md:py-20 bg-gray-100"><div class="container mx-auto px-6 max-w-4xl"><h2 class="text-3xl font-bold mb-6">Explore the problem before we talk.</h2><ul class="space-y-4">{guides}</ul><h3 class="text-xl font-semibold mt-10 mb-4">Related services</h3><ul class="space-y-4">{related}</ul></div></section>
    <section class="py-16 md:py-20 bg-brand-gradient text-white"><div class="container mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl md:text-4xl font-bold mb-5">Bring one problem and the outcome you need.</h2><p class="text-lg mb-8">Tell us what takes too much effort, where work gets stuck or what you need to make possible. We can define a useful next step with your team.</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md hover:bg-gray-100" href="/#contact">{esc(offer['cta'])}</a><p class="mt-6">Or email <a class="underline underline-offset-4 break-all" href="mailto:solutions@solvero.co.za">solutions@solvero.co.za</a>.</p></div></section>'''


service_template = (ROOT / '_templates/service.html').read_text()
for offer in SERVICES:
    service_url = SITE + 'services/' + offer['slug'] + '/'
    service_page = {'@type': 'WebPage', '@id': service_url + '#webpage', 'url': service_url, 'name': offer['title'], 'description': offer['description'], 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'mainEntity': {'@id': service_url + '#service'}, 'breadcrumb': {'@id': service_url + '#breadcrumb'}}
    service = {'@type': 'Service', '@id': service_url + '#service', 'url': service_url, 'name': offer['name'], 'serviceType': offer['name'], 'description': offer['description'], 'areaServed': 'Worldwide', 'provider': {'@id': SITE + '#organization'}}
    write_page('services/' + offer['slug'] + '/index.html', offer['title'], offer['description'], service_url, [service_page, service, breadcrumbs(service_url, offer['name'])], service_main(offer), page_template=service_template)


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
listing = {'@type': 'ItemList', '@id': url + '#articles', 'numberOfItems': len(META), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': a['headline'], 'url': a['canonical']} for i, a in enumerate(META, 1)]}
cards = ''.join(f'''<article class="bg-gray-50 p-8 rounded-lg flex flex-col"><p class="text-sm text-gray-600 mb-3">{html.escape(a['section'])}</p><h3 class="text-2xl font-semibold text-gray-800 mb-4"><a class="hover:text-brand-primary underline underline-offset-4" href="/blog/{a['slug']}/">{html.escape(a['headline'])}</a></h3><p class="text-gray-700 mb-5">{html.escape(a['description'])}</p><p class="text-sm text-gray-600 mt-auto">By <a class="underline" href="/authors/jateen-narsai/">Jateen Narsai</a> · <time datetime="{a['datePublished']}">{date_label(a["datePublished"])}</time></p></article>''' for a in META)
main = hero('Make work easier and get useful changes delivered.', 'Practical guides to finding bottlenecks, improving processes and delivering solutions across people and systems.', trail_label='Blog') + f'<section class="bg-white py-16" aria-labelledby="articles-heading"><div class="container mx-auto px-6 max-w-6xl"><h2 id="articles-heading" class="text-3xl font-bold text-gray-800 mb-8">Practical guides and worksheets</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-8">{cards}</div></div></section>' + '''<section class="bg-brand-gradient text-white py-16"><div class="mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl font-bold mb-5">Where is manual work holding you back?</h2><p class="text-lg mb-8">We review how work happens, simplify the process and deliver the agreed change. Explore <a class="underline" href="/services/workflow-automation/">process improvement and business process automation</a>, or tell us about a broader <a class="underline" href="/#services">business improvement or solution delivery need</a>.</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md" href="/#contact">Discuss your challenge</a></div></section>'''
write_page('blog/index.html', title, description, url, [collection, listing, breadcrumbs(url, 'Blog')], main)
urls = [SITE, SITE + 'services/workflow-automation/'] + [SITE + 'services/' + offer['slug'] + '/' for offer in SERVICES] + [url] + [a['canonical'] for a in META] + [AUTHOR['canonical']]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + u + '</loc></url>\n' for u in urls) + '</urlset>\n')
print(f'Generated {len(SERVICES)} offer pages, {len(META)} articles, the biography, blog index and {len(urls)}-page sitemap.')
