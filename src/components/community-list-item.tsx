import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Community } from '@/types/community';

type CommunityListItemProps = {
  community: Community;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function CommunityListItemComponent({ community }: CommunityListItemProps) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/community/[id]', params: { id: community.id } }} asChild>
      <Pressable>
        <ThemedView type="surface" elevated style={styles.container}>
          <ThemedView style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <ThemedText type="subtitle" themeColor="onAccent">
              {getInitial(community.name)}
            </ThemedText>
          </ThemedView>

          <ThemedView type="surface" style={styles.content}>
            <ThemedView type="surface" style={styles.header}>
              <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
                {community.name}
              </ThemedText>
              {community.isJoined ? (
                <ThemedView style={[styles.badge, { backgroundColor: theme.accent }]}>
                  <ThemedText type="eyebrow" themeColor="onAccent">
                    Joined
                  </ThemedText>
                </ThemedView>
              ) : null}
            </ThemedView>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={2}
              style={styles.description}
            >
              {community.description}
            </ThemedText>

            <ThemedView type="surface" style={styles.footer}>
              <Ionicons name="people-outline" size={14} color={theme.textSecondary} />
              <ThemedText type="eyebrow" themeColor="textSecondary">
                {community.memberCount.toLocaleString()} members
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export const CommunityListItem = memo(CommunityListItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
  },
  description: {
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
});
