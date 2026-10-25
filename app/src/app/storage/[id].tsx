// Storage details for one food: times per location, source notes and attribution.

import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppText, Card, MessageState, SourceNote } from '../../components/ui';
import { useStrings } from '../../i18n/locale';
import { formatBasis, formatDuration, LOCATION_ORDER } from '../../storage/format';
import { getItemDetail } from '../../storage/queries';

type Detail = NonNullable<Awaited<ReturnType<typeof getItemDetail>>>;

export default function StorageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { lang, s } = useStrings();
  const [detail, setDetail] = useState<Detail | null | undefined>(undefined);

  useEffect(() => {
    getItemDetail(db, id).then(setDetail);
  }, [db, id]);

  if (detail === undefined) return <View className="flex-1 bg-background" />;
  if (detail === null) return <View className="flex-1 bg-background"><MessageState title={s.notFound} /></View>;

  const { item, periods, notes, source } = detail;
  const name = lang === 'da' ? item.name_da : item.name_en;
  const subtitle = lang === 'da' ? item.subtitle_da : item.subtitle_en;
  const otherName = lang === 'da' ? item.name_en : item.name_da;

  return (
    <ScrollView className="flex-1 bg-background" contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4 pb-12">
      <Stack.Screen options={{ title: name }} />
      <View>
        <AppText variant="title" accessibilityRole="header">{name}</AppText>
        {subtitle ? <AppText variant="secondary">{subtitle}</AppText> : null}
        <AppText variant="caption" accessibilityLanguage={lang === 'da' ? 'en' : 'da'}>{otherName}</AppText>
      </View>

      {LOCATION_ORDER.map((location) => {
        const here = periods.filter((p) => p.location === location);
        const hereNotes = notes.filter((n) => n.location === location);
        if (here.length === 0 && hereNotes.length === 0) return null;
        return (
          <Card key={location} className="gap-2">
            <AppText variant="heading" accessibilityRole="header">{s.locations[location]}</AppText>
            {here.length === 0 ? <AppText variant="secondary">{s.noTimeGiven}</AppText> : null}
            {here.map((p, i) => {
              const basis = formatBasis(p, s);
              return (
                <View key={i} className="flex-row flex-wrap items-baseline gap-x-2">
                  <AppText className="font-semibold">{formatDuration(p, s)}</AppText>
                  {basis ? <AppText variant="secondary">{basis}</AppText> : null}
                </View>
              );
            })}
            {hereNotes.map((n, i) => (
              <SourceNote key={i} text={n.text} lang={n.lang} label={n.lang !== lang ? s.sourceLanguageNote : null} />
            ))}
          </Card>
        );
      })}

      <AppText variant="caption">{s.disclaimer}</AppText>

      <View className="gap-1 border-t border-border pt-4">
        <AppText variant="heading" accessibilityRole="header">{s.sourceHeading}</AppText>
        <AppText variant="secondary">{source.publisher}</AppText>
        <AppText variant="secondary">{source.title} · {source.license}</AppText>
        {source.data_version ? <AppText variant="caption">{s.dataDate(source.data_version)}</AppText> : null}
        <AppText variant="caption">{source.attribution}</AppText>
        <AppText variant="caption" selectable>{source.url}</AppText>
      </View>
    </ScrollView>
  );
}
