// A list of guides linking to each (D-037), numbered where the order matters (first aid).

import { LinkRow, RowList } from './ui';
import type { GuideRow } from '../db/queries';
import { hrefs } from '../router';

export function GuideList({ guides, numbered = true }: { guides: GuideRow[]; numbered?: boolean }) {
  return (
    <RowList ordered lang="da">
      {guides.map((g, i) => (
        <LinkRow
          key={g.id}
          href={hrefs.guide(g.id)}
          leading={
            numbered ? (
              <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-background text-sm font-semibold text-muted">
                {i + 1}
              </span>
            ) : undefined
          }
          title={g.name ?? g.title}
          subtitle={
            <>
              <TitleAbbreviations guide={g} />
              {g.season ? <span className="block text-sm text-muted">{g.season}</span> : g.summary ? <span className="line-clamp-2 block text-sm text-muted">{g.summary}</span> : null}
            </>
          }
        />
      ))}
    </RowList>
  );
}

// Abbreviations in a title, explained right under it (e.g. "HLR: hjertelungeredning").
function TitleAbbreviations({ guide }: { guide: GuideRow }) {
  const used = guide.abbreviations.filter((a) => guide.title.includes(a.short));
  if (used.length === 0) return null;
  return <span className="block text-sm text-muted">{used.map((a) => `${a.short}: ${a.long}`).join(' · ')}</span>;
}
