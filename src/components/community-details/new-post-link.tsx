import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/hooks';
import type { AppStackParamList } from '@/navigation';

type NewPostLinkProps = {
  communityId: string;
  isJoined: boolean;
};

export function NewPostLink({ communityId, isJoined }: NewPostLinkProps) {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  if (!isJoined) {
    return (
      <ThemedView
        style={[styles.button, styles.buttonDisabled, { backgroundColor: theme.surfaceSelected }]}
      >
        <Ionicons name="add" size={16} color={theme.textSecondary} />
        <ThemedText type="linkPrimary" themeColor="textSecondary">
          New Post
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('CreatePost', { id: communityId })}
      style={StyleSheet.flatten([styles.button, { backgroundColor: theme.surfaceSelected }])}
    >
      <Ionicons name="add" size={16} color={theme.accent} />
      <ThemedText type="linkPrimary">New Post</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
