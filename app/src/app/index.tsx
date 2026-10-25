// Food storage lookup (D-014): search a food, open it to see storage times.

import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { AppText, MessageState, SearchField } from '../components/ui';
import { useStrings } from '../i18n/locale';
import { listItems, searchItems, type ItemRow } from '../storage/queries';
import { MIN_FTS_QUERY_LENGTH, prefixFilter, rankResults } from '../storage/search';

export default function StorageSearchScreen() {
  const db = useSQLiteContext();
  const { lang, s } = useStrings();
  const [query, setQuery] = useState('');
  const [all, setAll] = useState<ItemRow[] | null>(null);
  const [matches, setMatches] = useState<ItemRow[] | null>(null);

  useEffect(() => {
    listItems(db).then(setAll);
  }, [db]);

  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < MIN_FTS_QUERY_LENGTH) {
      setMatches(null);
      return;
    }
    let current = true;
    searchItems(db, trimmed).then((rows) => {
      if (current) setMatches(rows);
    });
    return () => {
      current = false;
    };
  }, [db, trimmed]);

  const results = useMemo(() => {
    if (!all) return null;
    if (trimmed === '') return [...all].sort((a, b) => displayName(a, lang).localeCompare(displayName(b, lang), lang));
    const rows = trimmed.length < MIN_FTS_QUERY_LENGTH ? prefixFilter(all, trimmed) : matches;
    return rows ? rankResults(rows, trimmed, lang) : null;
  }, [all, matches, trimmed, lang]);

  return (
    <FlatList
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      data={results ?? []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="px-4 pb-2 pt-2">
          <SearchField value={query} onChangeText={setQuery} placeholder={s.searchPlaceholder} label={s.searchLabel} clearLabel={s.clearSearch} />
          {results ? (
            <AppText variant="caption" className="mt-2" accessibilityLiveRegion="polite">
              {s.itemCount(results.length)}
            </AppText>
          ) : null}
        </View>
      }
      ListEmptyComponent={results && trimmed !== '' ? <MessageState title={s.noResults(trimmed)} /> : undefined}
      renderItem={({ item }) => <ItemListRow item={item} lang={lang} />}
      ItemSeparatorComponent={() => <View className="ml-4 h-px bg-border" />}
    />
  );
}

function displayName(item: ItemRow, lang: 'da' | 'en') {
  return lang === 'da' ? item.name_da : item.name_en;
}

function ItemListRow({ item, lang }: { item: ItemRow; lang: 'da' | 'en' }) {
  const name = displayName(item, lang);
  const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
  const otherName = lang === 'da' ? item.name_en : item.name_da;
  return (
    <Link href={{ pathname: '/storage/[id]', params: { id: item.id } }} asChild>
      <Pressable className="min-h-14 justify-center bg-background px-4 py-3 active:bg-surface" accessibilityRole="button">
        <AppText>{name}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
        <AppText variant="caption" accessibilityLanguage={lang === 'da' ? 'en' : 'da'}>
          {otherName}
        </AppText>
      </Pressable>
    </Link>
  );
}
