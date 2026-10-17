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
spec = importlib.util.spec_from_file_location('renderer', ROOT / 'tools/content-renderer.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
renderer.LINKS = {a['file'] + '.md': '/blog/' + a['slug'] + '/' for a in META}
renderer.LINKS['author-jateen-narsai.md'] = '/authors/jateen-narsai/'
renderer.IMAGE_SIZES = {image['src']: (image['width'], image['height']) for a in META for image in a.get('images', [])}
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


def write_page(relative, title, description, url, nodes, main, extra_head='', image=None):
    schema = json.dumps({'@context': 'https://schema.org', '@graph': shared + nodes}, ensure_ascii=False, indent=2).replace('</', '<\\/')
    values = {'TITLE': html.escape(title), 'DESCRIPTION': html.escape(description, quote=True), 'URL': url, 'SCHEMA': schema, 'MAIN': main, 'EXTRA_HEAD': extra_head, 'EDITORIAL_VERSION': hashlib.sha256((ROOT / 'styles/editorial.css').read_bytes()).hexdigest()[:12]}
    values.update({'IMAGE_URL': image['url'] if image else SITE + 'images/optimised/solvero-logo.webp', 'IMAGE_ALT': html.escape(image['alt'], quote=True) if image else 'Solvero logo', 'TWITTER_CARD': 'summary_large_image' if image else 'summary'})
    page = template
    for key, value in values.items():
        page = page.replace('{{' + key + '}}', value)
    if any(n['@type'] == 'BlogPosting' for n in nodes):
        page = page.replace('property="og:type" content="website"', 'property="og:type" content="article"')
    file = ROOT / relative
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(page)


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
title = 'Process Improvement & Workflow Automation Blog | Solvero'
description = 'Practical guides to process improvement, workflow automation and connected systems, with editable worksheets to help you plan your next improvement.'
collection = {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': title, 'description': description, 'inLanguage': 'en', 'isPartOf': {'@id': SITE + '#website'}, 'publisher': {'@id': SITE + '#organization'}, 'breadcrumb': {'@id': url + '#breadcrumb'}, 'mainEntity': {'@id': url + '#articles'}}
listing = {'@type': 'ItemList', '@id': url + '#articles', 'numberOfItems': len(META), 'itemListElement': [{'@type': 'ListItem', 'position': i, 'name': a['headline'], 'url': a['canonical']} for i, a in enumerate(META, 1)]}
cards = ''.join(f'''<article class="bg-gray-50 p-8 rounded-lg flex flex-col"><p class="text-sm text-gray-600 mb-3">{html.escape(a['section'])}</p><h3 class="text-2xl font-semibold text-gray-800 mb-4"><a class="hover:text-brand-primary underline underline-offset-4" href="/blog/{a['slug']}/">{html.escape(a['headline'])}</a></h3><p class="text-gray-700 mb-5">{html.escape(a['description'])}</p><p class="text-sm text-gray-600 mt-auto">By <a class="underline" href="/authors/jateen-narsai/">Jateen Narsai</a> · <time datetime="{a['datePublished']}">{date_label(a["datePublished"])}</time></p></article>''' for a in META)
main = hero('Better workflows. Less manual work.', 'Practical guides for the people responsible for improving processes, automating repeated tasks and connecting business systems.', trail_label='Blog') + f'<section class="bg-white py-16" aria-labelledby="articles-heading"><div class="container mx-auto px-6 max-w-6xl"><h2 id="articles-heading" class="text-3xl font-bold text-gray-800 mb-8">Practical guides and worksheets</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-8">{cards}</div></div></section>' + '''<section class="bg-brand-gradient text-white py-16"><div class="mx-auto px-6 max-w-4xl text-center"><h2 class="text-3xl font-bold mb-5">Where is manual work holding you back?</h2><p class="text-lg mb-8">Solvero helps analyse your process and implement the improvement. Explore <a class="underline" href="/services/workflow-automation/">our workflow automation service</a>, or describe a workflow you want to improve.</p><a class="inline-block bg-white text-brand-primary font-semibold px-7 py-4 rounded-md" href="/#contact">Discuss your workflow</a></div></section>'''
write_page('blog/index.html', title, description, url, [collection, listing, breadcrumbs(url, 'Blog')], main)
urls = [SITE, SITE + 'services/workflow-automation/', url] + [a['canonical'] for a in META] + [AUTHOR['canonical']]
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>' + u + '</loc></url>\n' for u in urls) + '</urlset>\n')
print(f'Generated {len(META)} articles, the biography, blog index and {len(urls)}-page sitemap.')
