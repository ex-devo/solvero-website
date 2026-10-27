"""Shared article presentation for published pages and local editorial previews."""
from datetime import datetime
import html
import re


def date_label(value):
    parsed = datetime.fromisoformat(value).date()
    return f'{parsed.day} {parsed.strftime("%B %Y")}'


def article_main(article, author, markdown, renderer, draft_date=None):
    body = re.sub(r'^# .*?\n\nBy .*?\n\n', '', markdown, count=1)
    lead = article['images'][0]
    image_pattern = r'^!\[[^\]]*\]\(' + re.escape(lead['src']) + r'\)\n(?:\n\*[^*\n]+\*\n)?'
    match = re.search(image_pattern, body, re.M)
    if match is None:
        raise ValueError(f"{article['headline']}: lead image must appear in the article Markdown")
    lead_html = renderer.render(match[0].split('\n', 1)[0])
    lead_html = re.sub(r' sizes="[^"]*"', ' sizes="(min-width: 1024px) 384px, (min-width: 368px) 320px, calc(100vw - 48px)"', lead_html)
    body = body[:match.start()] + body[match.end():]
    sections = renderer.section_headings(body)
    links = ''.join(f'<li><a href="#{item["id"]}">{html.escape(item["text"])}</a></li>' for item in sections)
    contents = '<nav aria-label="On this page"><ol>' + links + '</ol></nav>'
    author_url = html.escape(author['url'], quote=True)
    details = f'<div class="article-meta-item"><dt>Author</dt><dd><a rel="author" href="{author_url}">{html.escape(author["name"])}</a></dd></div>'
    if draft_date is not None:
        details += f'<div class="article-meta-item article-date"><dt>Updated</dt><dd><time datetime="{draft_date}">{date_label(draft_date)}</time></dd></div>'
    else:
        published = article['datePublished']
        modified = article['dateModified']
        updated = modified > published
        visible_date = modified if updated else published
        label = 'Updated' if updated else 'Published'
        kind = 'article-updated' if updated else 'article-published'
        details += f'<div class="article-meta-item article-date {kind}"><dt>{label}</dt><dd><time datetime="{visible_date}">{date_label(visible_date)}</time></dd></div>'
    return f'''<article class="editorial-article">
      <header class="editorial-hero article-hero">
        <div class="article-hero-inner">
          <div class="article-heading">
            <a class="article-blog-link" href="/blog/">Solvero Blog</a>
            <p class="article-topic">{html.escape(article['section'])}</p>
            <h1>{html.escape(article['headline'])}</h1>
            <dl class="article-meta">{details}</dl>
          </div>
          <div class="article-hero-media">{lead_html}</div>
        </div>
      </header>
      <div class="article-layout">
        <details class="article-mobile-contents"><summary>On this page</summary>{contents}</details>
        <div class="article-body">{renderer.render(body)}</div>
        <aside class="article-sidebar"><div class="article-contents"><p class="article-contents-title">On this page</p>{contents}</div></aside>
      </div>
    </article>'''
