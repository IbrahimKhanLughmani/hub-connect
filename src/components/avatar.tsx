import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getInitial } from '@/utils/get-initial';

type AvatarProps = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 40 }: AvatarProps) {
  const theme = useTheme();

  return (
    <ThemedView
      style={[styles.avatar, { width: size, height: size, backgroundColor: theme.accent }]}
    >
      <ThemedText type="subtitle" themeColor="onAccent">
        {getInitial(name)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
