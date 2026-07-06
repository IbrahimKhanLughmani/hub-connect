import { Colors, Theme } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export function useTheme(): Theme {
  const scheme = useResolvedColorScheme();

  return Colors[scheme];
}
