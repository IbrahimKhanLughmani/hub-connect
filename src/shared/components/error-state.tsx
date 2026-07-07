import { StyleSheet } from 'react-native';

import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/styles';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.message}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {message}
      </ThemedText>
      <Button variant="ghost" label="Retry" onPress={onRetry} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  message: {
    textAlign: 'center',
  },
});
