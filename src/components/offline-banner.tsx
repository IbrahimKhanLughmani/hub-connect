import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
      <ThemedText type="smallBold" style={styles.text}>
        You&apos;re offline — showing saved data
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
  },
});
