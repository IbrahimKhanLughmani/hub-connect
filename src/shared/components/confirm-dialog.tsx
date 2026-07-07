import { Modal, Pressable, StyleSheet } from 'react-native';

import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.backdrop }]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      >
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <ThemedView
            type="surface"
            elevated
            accessibilityViewIsModal
            style={[styles.card, { borderColor: theme.border }]}
          >
            <ThemedText type="subtitle">{title}</ThemedText>
            {message ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
                {message}
              </ThemedText>
            ) : null}

            <ThemedView type="surface" style={styles.actions}>
              <ThemedView type="surface" style={styles.actionButton}>
                <Button variant="secondary" label={cancelLabel} onPress={onCancel} />
              </ThemedView>
              <ThemedView type="surface" style={styles.actionButton}>
                <Button
                  variant="secondary"
                  danger={destructive}
                  label={confirmLabel}
                  onPress={onConfirm}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  message: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
