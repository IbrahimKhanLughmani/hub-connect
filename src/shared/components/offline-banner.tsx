import { StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { useIsOnline, useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

export function OfflineBanner() {
  const theme = useTheme();
  const isOnline = useIsOnline();

  if (isOnline) {
    return null;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.error }]}>
      <ThemedText type="smallBold" style={{ color: theme.onError }}>
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
});
