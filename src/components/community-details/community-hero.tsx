import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants';
import { useTheme } from '@/hooks';
import type { Community } from '@/types';

type CommunityHeroProps = {
  community: Community;
  topInset: number;
};

export function CommunityHero({ community, topInset }: CommunityHeroProps) {
  const theme = useTheme();

  return (
    <ThemedView
      style={[styles.hero, { backgroundColor: theme.accent, paddingTop: topInset + Spacing.md }]}
    >
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={theme.onAccent} />
      </Pressable>
      <ThemedText type="eyebrow" themeColor="onAccent">
        Emaar Community
      </ThemedText>
      <ThemedText type="title" themeColor="onAccent">
        {community.name}
      </ThemedText>
      <ThemedText type="small" themeColor="onAccent" style={styles.description}>
        {community.description}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  description: {
    marginTop: Spacing.xs,
    lineHeight: 20,
    opacity: 0.9,
  },
});
