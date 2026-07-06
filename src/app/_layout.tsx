import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ErrorBoundary, OfflineBanner } from '@/components';
import { useResolvedColorScheme } from '@/hooks';
import { queryClient, queryPersister } from '@/lib';

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24;

export default function RootLayout() {
  const colorScheme = useResolvedColorScheme();

  return (
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE }}
        onSuccess={() => {
          void queryClient.resumePausedMutations();
        }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.container}>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
