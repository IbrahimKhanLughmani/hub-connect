import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { AnimatedCounter, ThemedText, ThemedView } from '@/components';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/hooks';

type CommunityStatsCardProps = {
  memberCount: number;
  postCount: number;
  isPostCountLoading: boolean;
};

export function CommunityStatsCard({
  memberCount,
  postCount,
  isPostCountLoading,
}: CommunityStatsCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="surface" elevated style={styles.statsCard}>
      <ThemedView type="surface" style={styles.statItem}>
        <Ionicons name="people" size={20} color={theme.accent} />
        <AnimatedCounter value={memberCount} type="title" style={styles.statValue} />
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Members
        </ThemedText>
      </ThemedView>
      <ThemedView style={[styles.statDivider, { backgroundColor: theme.border }]} />
      <ThemedView type="surface" style={styles.statItem}>
        <Ionicons name="chatbubble-ellipses" size={20} color={theme.accent} />
        {isPostCountLoading ? (
          <ThemedText type="title" style={styles.statValue}>
            —
          </ThemedText>
        ) : (
          <AnimatedCounter value={postCount} type="title" style={styles.statValue} />
        )}
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Posts
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 26,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
  },
});
