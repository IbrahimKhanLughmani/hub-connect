import { ActivityIndicator } from 'react-native';

import { useTheme } from '@/shared/hooks';

type LoadingIndicatorProps = {
  size?: number;
};

export function LoadingIndicator({ size = 64 }: LoadingIndicatorProps) {
  const theme = useTheme();

  return <ActivityIndicator size={size <= 40 ? 'small' : 'large'} color={theme.accent} />;
}
