# Splits the Handbook 66 text layer into one file per chapter (sections on their own lines),
# for reading while writing guides. Usage: python3 -I hb66_chapters.py <output dir>
# Each file starts with the chapter title; [pNNN] marks a PDF page (printed page = NNN - 10).
import os, re, sys
CONTENT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
HEAD = {'Scientific Name and Introduction', 'Scientific Names and Introduction', 'Specific Name and Introduction',
        'Quality Characteristics and Criteria', 'Horticultural Maturity Indices', 'Grades, Sizes, and Packaging',
        'Precooling Conditions', 'Pre-Cooling Conditions', 'Optimum Storage Conditions', 'Controlled Atmosphere (CA) Considerations',
        'Retail Outlet Display Considerations', 'Chilling Sensitivity', 'Ethylene Production and Sensitivity', 'Respiration Rates',
        'Physiological Disorders', 'Postharvest Pathology', 'Quarantine Issues', 'Suitability as Fresh-Cut Product',
        'Special Considerations', 'References', 'Acknowledgments'}
raw = open(os.path.join(CONTENT, 'sources', 'text', 'us-ars-ah66-2016.txt')).read().split('\n')[1:]
starts = [i for i, l in enumerate(raw) if l in ('Scientific Name and Introduction', 'Scientific Names and Introduction', 'Specific Name and Introduction')]
out_dir = sys.argv[1]; os.makedirs(out_dir, exist_ok=True)
for k, s in enumerate(starts):
    a, z = s - 12, (starts[k + 1] - 12 if k + 1 < len(starts) else len(raw))
    parts, prev = [], ''
    for l in raw[a:z]:
        if re.match(r'^--- p\d+$', l): parts.append(f'[{l[4:]}]'); prev = l; continue
        if re.match(r'^\d+$', l) and re.match(r'^--- p\d+$', prev): prev = l; continue
        prev = l
        l = l.replace('\ufffd', ' ').replace('\ufffc', '')
        parts.append(f'\n## {l}\n' if l.strip() in HEAD else l)
    text = re.sub(r' +', ' ', re.sub(r'[ \t]*\n[ \t]*(?!#)', ' ', ' \n'.join(parts)))
    text = re.split(r'\n## References', text)[0]
    first = re.sub(r'[^a-z]+', '-', ' '.join(raw[s + 1:s + 2]).lower())[:40].strip('-')
    open(os.path.join(out_dir, f'{k:03d}-{first}.txt'), 'w').write(text)
print(f'{len(starts)} chapters written to {out_dir}')
