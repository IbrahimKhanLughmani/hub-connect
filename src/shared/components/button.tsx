import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  danger?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  loading,
  danger,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary' ? theme.accent : variant === 'secondary' ? theme.surface : 'transparent';
  const textColor = danger
    ? theme.error
    : variant === 'primary'
      ? theme.onAccent
      : variant === 'secondary'
        ? theme.text
        : theme.accent;

  return (
    <Pressable
      disabled={isDisabled}
      style={[
        styles.base,
        variant !== 'ghost' && styles.padded,
        {
          backgroundColor,
          borderColor: theme.border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.6 : 1,
        },
      ]}
      {...rest}
    >
      {({ pressed }) => (
        <>
          {pressed && !isDisabled ? (
            <View style={[styles.pressedOverlay, { backgroundColor: theme.overlay }]} />
          ) : null}
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <View style={styles.content}>
              {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
              <ThemedText type="smallBold" style={{ color: textColor }}>
                {label}
              </ThemedText>
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  padded: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pressedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
