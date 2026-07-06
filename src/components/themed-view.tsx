import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants';
import { useTheme } from '@/hooks';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
  elevated?: boolean;
};

export function ThemedView({ style, type, elevated, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme[type ?? 'background'] }, elevated && styles.elevated, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  elevated: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
});
