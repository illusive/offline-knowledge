# Prints the recipe part of NCHFP snapshot pages, for reading while writing guides.
# Usage: python3 -I nchfp.py <slug> [<slug> ...]   (slug = registry id without 'nchfp-')
# Quotes must still be checked by the build (node scripts/quote-context.ts shows the exact text).
import sys,re,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from html2text import html_to_text
CONTENT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
for slug in sys.argv[1:]:
    path=os.path.join(CONTENT,'sources','snapshots',f'nchfp-{slug}.html')
    t=html_to_text(open(path).read())
    lines=[l.strip() for l in t.split('\n') if l.strip()]
    # body: from the line after 'Donations' block nav... take from first line containing 'Quantity' or 'Procedure' or 'Yield' minus 3, until 'Print this page'
    try: end=next(i for i,l in enumerate(lines) if l=='Print this page')
    except StopIteration: end=len(lines)
    title=re.search(r'<title>(.*?)</title>',open(path).read(),re.S).group(1).split(' - National Center')[0].strip()
    import html as h; title=h.unescape(title)
    start=max([i for i,l in enumerate(lines[:end]) if l==title] or [max(0,end-40)])
    print(f'##### {slug}'); print(' / '.join(lines[start:end])); print()
