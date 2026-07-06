import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useIsOnline } from '@/hooks/use-is-online';
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner() {
  const theme = useTheme();
  const isOnline = useIsOnline();

  if (isOnline) {
    return null;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.error }]}>
      <ThemedText type="small" style={styles.text}>
        You&apos;re offline — showing saved data
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
  },
});
