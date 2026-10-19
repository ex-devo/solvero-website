import html
import re

LINKS = {}
IMAGE_SIZES = {}
IMAGE_META = {}

def inline(text):
    text = html.escape(text)
    def link(match):
        label, target = match.groups()
        if target.endswith('.md') and not target.startswith(('https://', 'http://')):
            target = LINKS[target]
        elif target.startswith('assets/'):
            target = '/blog/downloads/' + target.removeprefix('assets/')
        return f'<a href="{target}">{label}</a>'
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', text)


def render(markdown):
    lines = markdown.splitlines()
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i])
                i += 1
            out.append('<pre><code>' + html.escape('\n'.join(code)) + '</code></pre>')
            i += 1
        elif re.fullmatch(r'!\[([^\]]+)\]\(([^)]+)\)', line):
            alt, target = re.fullmatch(r'!\[([^\]]+)\]\(([^)]+)\)', line).groups()
            width, height = IMAGE_SIZES[target]
            metadata = IMAGE_META[target]
            featured = metadata.get('role') == 'featured'
            attributes = 'loading="eager" fetchpriority="high"' if featured else 'loading="lazy"'
            if metadata.get('variants'):
                srcset = ', '.join(f'{variant["src"]} {variant["width"]}w' for variant in metadata['variants'])
                attributes += f' srcset="{html.escape(srcset, quote=True)}" sizes="(min-width: 896px) 848px, calc(100vw - 48px)"'
            figure = f'<figure><img src="{html.escape(target, quote=True)}" alt="{html.escape(alt, quote=True)}" width="{width}" height="{height}" {attributes} decoding="async" />'
            i += 1
            caption_at = i
            while caption_at < len(lines) and not lines[caption_at].strip():
                caption_at += 1
            if caption_at < len(lines) and re.fullmatch(r'\*[^*]+\*', lines[caption_at]):
                figure += '<figcaption>' + inline(lines[caption_at][1:-1]) + '</figcaption>'
                i = caption_at + 1
            out.append(figure + '</figure>')
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [s.strip() for s in lines[i].strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', s) for s in cells):
                    rows.append(cells)
                i += 1
            header = '<thead><tr>' + ''.join('<th scope="col">' + inline(s) + '</th>' for s in rows[0]) + '</tr></thead>'
            body = '<tbody>' + ''.join('<tr>' + ''.join('<td>' + inline(s) + '</td>' for s in row) + '</tr>' for row in rows[1:]) + '</tbody>'
            out.append('<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable planning table"><table>' + header + body + '</table></div>')
        elif line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            out.append(f'<h{level}>' + inline(line[level:].strip()) + f'</h{level}>')
            i += 1
        elif line.startswith('> '):
            out.append('<blockquote><p>' + inline(line[2:]) + '</p></blockquote>')
            i += 1
        elif line.startswith('- ') or re.match(r'\d+\. ', line):
            ordered = bool(re.match(r'\d+\. ', line))
            tag, pattern = ('ol', r'\d+\. ') if ordered else ('ul', r'- ')
            items = []
            while i < len(lines) and re.match(pattern, lines[i]):
                items.append('<li>' + inline(re.sub('^' + pattern, '', lines[i])) + '</li>')
                i += 1
            out.append(f'<{tag}>' + ''.join(items) + f'</{tag}>')
        else:
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip():
                paragraph.append(lines[i])
                i += 1
            out.append('<p>' + inline(' '.join(paragraph)) + '</p>')
    return '\n'.join(out)

