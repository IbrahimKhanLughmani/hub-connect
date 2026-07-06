import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { ThemePreference, useThemeStore } from '@/store/theme-store';

export function ThemeToggleButton() {
  const theme = useTheme();
  const resolvedScheme = useResolvedColorScheme();
  const setPreference = useThemeStore((state) => state.setPreference);

  function handleToggle() {
    setPreference(resolvedScheme === 'dark' ? ThemePreference.Light : ThemePreference.Dark);
  }

  return (
    <Pressable onPress={handleToggle} hitSlop={8} style={styles.button}>
      <Ionicons name={resolvedScheme === 'dark' ? 'sunny' : 'moon'} size={22} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: Spacing.lg,
  },
});
