import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ThemedTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export function ThemedTextInput({
  label,
  error,
  icon,
  isPassword,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}: ThemedTextInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error ? theme.error : isFocused ? theme.accent : theme.border;
  const effectiveSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <ThemedView style={styles.container}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <View style={styles.inputWrapper}>
        {icon ? (
          <Ionicons name={icon} size={18} color={theme.textSecondary} style={styles.icon} />
        ) : null}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : undefined,
            isPassword ? styles.inputWithTrailingIcon : undefined,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor,
            },
            style,
          ]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={effectiveSecureTextEntry}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={8}
            style={styles.trailingIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText type="small" style={{ color: theme.error }}>
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  trailingIcon: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: Spacing.xl + Spacing.md,
  },
  inputWithTrailingIcon: {
    paddingRight: Spacing.xl + Spacing.md,
  },
});
