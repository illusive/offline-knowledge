import '../../global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { MessageState } from '../components/ui';
import { useStrings } from '../i18n/locale';
import { packAsset, packDatabaseName, verifyPack } from '../pack/pack';

export default function RootLayout() {
  const { s } = useStrings();
  // Native headers follow the navigation theme, which must track the system appearance.
  const navigationTheme = useColorScheme() === 'dark' ? DarkTheme : DefaultTheme;
  const [packError, setPackError] = useState<Error | null>(null);

  if (packError) {
    return (
      <View className="flex-1 justify-center bg-background">
        <MessageState title={s.packErrorTitle} body={s.packErrorBody} />
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName={packDatabaseName} assetSource={{ assetId: packAsset }} onInit={verifyPack} onError={setPackError}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerBackTitle: s.back }}>
          <Stack.Screen name="index" options={{ title: s.storageTitle, headerLargeTitle: true }} />
          <Stack.Screen name="storage/[id]" options={{ title: '' }} />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
