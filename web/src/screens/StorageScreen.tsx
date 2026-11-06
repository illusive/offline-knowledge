// "Opbevaring" category (D-014): all foods, searchable, in headed groups (D-057); each opens its
// storage details.

import { FoodList } from '../components/FoodList';
import { SavedLink } from '../bookmarks/BookmarkButton';
import { Page, SearchField, SubPageHeader } from '../components/ui';
import type { DbClient } from '../db/client';
import type { ItemRow } from '../db/queries';
import type { Lang, Strings } from '../i18n/strings';
import { hrefs } from '../router';
import { useFoodSearch } from '../food/useFoodSearch';
import { usePageTitle } from '../lib/usePageTitle';

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

  usePageTitle(s.storingFood, s.appTitle);

  return (
    <Page>
      <SubPageHeader backLabel={s.back} backTo={hrefs.home} title={s.storingFood} subtitle={s.storageIntro} action={<SavedLink section="storage" s={s} />} />
      <div className="mb-3">
        <SearchField id="storage-search" value={query} onChange={onQueryChange} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
      </div>
      <FoodList items={results} query={query} lang={lang} s={s} grouped />
    </Page>
  );
}
