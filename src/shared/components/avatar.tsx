import { StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { useTheme } from '@/shared/hooks';
import { Radius } from '@/shared/styles';
import { getInitial } from '@/shared/utils';

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
