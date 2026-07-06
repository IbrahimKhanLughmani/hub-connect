import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Community } from '@/types/community';

type CommunityListItemProps = {
  community: Community;
};

function CommunityListItemComponent({ community }: CommunityListItemProps) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/community/[id]', params: { id: community.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.container}>
          <ThemedView type="backgroundElement" style={styles.header}>
            <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
              {community.name}
            </ThemedText>
            {community.isJoined ? (
              <ThemedView style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="small">Joined</ThemedText>
              </ThemedView>
            ) : null}
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {community.description}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {community.memberCount.toLocaleString()} members
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export const CommunityListItem = memo(CommunityListItemComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
