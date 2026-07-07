import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/app/routes';
import { registerMembershipMutationDefaults } from '@/features/communities';
import { ErrorBoundary, OfflineBanner } from '@/shared/components';
import { useResolvedColorScheme } from '@/shared/hooks';
import { queryClient, queryPersister } from '@/shared/lib';

const PERSIST_MAX_AGE = 1000 * 60 * 60 * 24;

registerMembershipMutationDefaults(queryClient);

export default function App() {
  const colorScheme = useResolvedColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: queryPersister, maxAge: PERSIST_MAX_AGE }}
            onSuccess={() => {
              void queryClient.resumePausedMutations();
            }}
          >
            <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <View style={styles.container}>
                <OfflineBanner />
                <RootNavigator />
              </View>
            </NavigationContainer>
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
