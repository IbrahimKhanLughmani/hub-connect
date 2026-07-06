import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants';
import { useResolvedColorScheme, useTheme } from '@/hooks';
import { ThemePreference, useThemeStore } from '@/store';

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
