# Readable text of an HTML snapshot, one block per line (authoring aid; the build uses lib/produce.ts htmlToText).
# Usage: python3 -I html2text.py <file.html>
import sys, re
from html.parser import HTMLParser

class _P(HTMLParser):
    def __init__(self):
        super().__init__(); self.out = []; self.skip = 0
    def handle_starttag(self, t, a):
        if t in ('script', 'style', 'noscript', 'svg'): self.skip += 1
        if t in ('p', 'li', 'h1', 'h2', 'h3', 'h4', 'br', 'div', 'tr', 'td', 'th'): self.out.append('\n')
    def handle_endtag(self, t):
        if t in ('script', 'style', 'noscript', 'svg'): self.skip -= 1
    def handle_data(self, d):
        if not self.skip: self.out.append(d)

def html_to_text(html):
    p = _P(); p.feed(html)
    t = re.sub(r'[ \t]+', ' ', ''.join(p.out))
    return re.sub(r'\n\s*\n+', '\n', t).strip()

if __name__ == '__main__':
    print(html_to_text(open(sys.argv[1], encoding='utf-8', errors='replace').read()))
