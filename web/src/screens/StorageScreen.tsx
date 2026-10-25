// "Storing food" category (D-014): all foods, searchable; each opens its storage details.

import { useEffect } from 'react';
import { FoodList } from '../components/FoodList';
import { BackButton, Page, SearchField } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { goBack, hrefs } from '../router';
import { useFoodSearch } from '../storage/useFoodSearch';

export function StorageScreen(props: {
  db: DbClient;
  foods: ItemRow[] | null;
  lang: Lang;
  s: Strings;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const { db, foods, lang, s, query, onQueryChange } = props;
  const results = useFoodSearch(db, foods, query, lang);

  useEffect(() => {
    document.title = `${s.storingFood} – ${s.appTitle}`;
  }, [s]);

  return (
    <Page>
      <BackButton label={s.back} onClick={() => goBack(hrefs.home)} />
      <header className="mt-4 mb-4 px-1">
        <h1 className="text-3xl font-normal tracking-tight">{s.storingFood}</h1>
        <p className="mt-1 text-muted">{s.storageIntro}</p>
      </header>
      <div className="mb-3">
        <SearchField id="storage-search" value={query} onChange={onQueryChange} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
      </div>
      <FoodList items={results} query={query} lang={lang} s={s} />
    </Page>
  );
}
