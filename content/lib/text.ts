// Source text for the checks (D-016, D-037): the text layer of a PDF snapshot made by
// scripts/extract-pdf-text.swift, and the one way quotes are looked up in it.

export function normalize(text: string): string {
  return text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}

// The text file's first line names the snapshot it was extracted from; refuse any other.
export function snapshotBody(raw: string, sourceId: string, snapshotSha256: string): string {
  const [header = '', ...rest] = raw.split('\n');
  if (header !== `# ${sourceId} sha256 ${snapshotSha256}`) throw new Error(`Text of ${sourceId} was extracted from another snapshot; rerun extract-pdf-text.swift`);
  return rest.join('\n');
}

// Page markers ("--- p12") and the printed page number next to one (or ending the text) dropped.
function withoutPageMarks(body: string): string {
  const lines = body.split('\n');
  return lines
    .filter((line, i) => {
      if (/^--- p\d+$/.test(line)) return false;
      const marker = (l: string | undefined) => /^--- p\d+$/.test(l ?? '');
      return !(/^\d{1,3}$/.test(line) && (marker(lines[i - 1]) || marker(lines[i + 1]) || i === lines.length - 1));
    })
    .join('\n');
}

// For quotes (food guides, second authorities): the text as printed, in one line. PDFKit gives
// U+FFFD for some table spaces and U+FFFC for embedded objects.
export function pdfText(raw: string, sourceId: string, snapshotSha256: string): string {
  return normalize(withoutPageMarks(snapshotBody(raw, sourceId, snapshotSha256)).replace(/\uFFFD/g, ' ').replace(/\uFFFC/g, ''));
}

// For the verbatim check of shown text (D-037): also words broken across lines joined
// ("Situa-\ntionen" → "Situationen"; a dash before a capital is a list dash and stays), soft hyphens
// removed, bullet glyphs turned into spaces. `body` is the text without its checksum line.
export function verbatimText(body: string): string {
  return normalize(
    withoutPageMarks(body)
      .replace(/\u00AD/g, '')
      .replace(/-\n(?=[a-zæøå])/g, '')
      .replace(/[\uF0B7\uF0A7\u2022\uFFFD\uFFFC]/g, ' '),
  );
}

// The parts of a quote that are not in the text. A quote may skip words with " … " between its
// parts; [bracketed] words are editorial (e.g. a table's column name) and are not looked for.
export function missingQuoteParts(text: string, quote: string): string[] {
  return quote.split(' … ').filter((part) => !text.includes(normalize(part.replace(/\[[^\]]*\]/g, ' '))));
}
