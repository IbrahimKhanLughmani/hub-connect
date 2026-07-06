import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { CommunityPostItem } from '@/components/community-post-item';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCommunity } from '@/hooks/use-community';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/use-community-membership';
import { usePosts } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import type { Post } from '@/types/post';

function CommunityDetailsContent() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const communityQuery = useCommunity(id);
  const postsQuery = usePosts(id);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();

  const community = communityQuery.data;
  const membershipPending = joinMutation.isPending || leaveMutation.isPending;
  const membershipFailed = joinMutation.isError || leaveMutation.isError;

  function handleToggleMembership() {
    if (!community) return;

    if (community.isJoined) {
      leaveMutation.mutate(community.id);
    } else {
      joinMutation.mutate(community.id);
    }
  }

  function renderPost({ item }: { item: Post }) {
    return <CommunityPostItem post={item} />;
  }

  if (communityQuery.isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.text} />
      </ThemedView>
    );
  }

  if (communityQuery.isError || !community) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small">Couldn&apos;t load this community.</ThemedText>
        <Pressable onPress={() => communityQuery.refetch()}>
          <ThemedText type="linkPrimary">Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const posts = postsQuery.data ?? [];

  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      refreshing={postsQuery.isRefetching}
      onRefresh={postsQuery.refetch}
      ListHeaderComponent={
        <ThemedView style={styles.header}>
          <ThemedText type="title">{community.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {community.description}
          </ThemedText>

          <ThemedView style={styles.statsRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {community.memberCount.toLocaleString()} members
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {postsQuery.isLoading ? '…' : posts.length} posts
            </ThemedText>
          </ThemedView>

          <Pressable
            disabled={membershipPending}
            onPress={handleToggleMembership}
            style={[
              styles.membershipButton,
              {
                backgroundColor: community.isJoined ? theme.backgroundElement : theme.text,
                opacity: membershipPending ? 0.6 : 1,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{
                color: membershipFailed
                  ? theme.error
                  : community.isJoined
                    ? theme.text
                    : theme.background,
              }}>
              {membershipPending
                ? community.isJoined
                  ? 'Leaving…'
                  : 'Joining…'
                : membershipFailed
                  ? 'Retry'
                  : community.isJoined
                    ? 'Leave'
                    : 'Join'}
            </ThemedText>
          </Pressable>

          <ThemedText type="smallBold" style={styles.postsHeading}>
            Posts
          </ThemedText>

          {postsQuery.isLoading ? (
            <ActivityIndicator color={theme.text} style={styles.postsLoading} />
          ) : postsQuery.isError ? (
            <ThemedView style={styles.postsError}>
              <ThemedText type="small">Couldn&apos;t load posts.</ThemedText>
              <Pressable onPress={() => postsQuery.refetch()}>
                <ThemedText type="linkPrimary">Retry</ThemedText>
              </Pressable>
            </ThemedView>
          ) : null}
        </ThemedView>
      }
      ListEmptyComponent={
        !postsQuery.isLoading && !postsQuery.isError ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.emptyPosts}>
            No posts yet.
          </ThemedText>
        ) : null
      }
    />
  );
}

export default function CommunityDetailsScreen() {
  return (
    <ErrorBoundary>
      <CommunityDetailsContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  membershipButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  postsHeading: {
    marginTop: 16,
  },
  postsLoading: {
    marginTop: 8,
  },
  postsError: {
    marginTop: 8,
    gap: 4,
  },
  emptyPosts: {
    textAlign: 'center',
    marginTop: 24,
  },
  separator: {
    height: 12,
  },
});
