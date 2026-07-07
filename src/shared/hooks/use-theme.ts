import { useResolvedColorScheme } from '@/shared/hooks/use-resolved-color-scheme';
import { Colors, Theme } from '@/shared/styles';

export function useTheme(): Theme {
  const scheme = useResolvedColorScheme();

  return Colors[scheme];
}
