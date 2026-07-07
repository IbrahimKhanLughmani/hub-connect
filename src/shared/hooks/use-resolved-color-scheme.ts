import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemePreference, useThemeStore } from '@/shared/store';

export function useResolvedColorScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);

  if (preference !== ThemePreference.System) {
    return preference;
  }

  return systemScheme === 'unspecified' ? 'light' : systemScheme;
}
