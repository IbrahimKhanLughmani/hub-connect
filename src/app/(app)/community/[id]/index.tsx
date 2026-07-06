import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedCounter } from '@/components/animated-counter';
import { Button } from '@/components/button';
import { CommunityPostItem } from '@/components/community-post-item';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorState } from '@/components/error-state';
import { LoadingIndicator } from '@/components/loading-indicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useCommunity } from '@/hooks/use-community';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/use-community-membership';
import { useCreatePost } from '@/hooks/use-create-post';
import { usePosts } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import type { Post } from '@/types/post';

function CommunityDetailsContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const communityQuery = useCommunity(id);
  const postsQuery = usePosts(id);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const createPostMutation = useCreatePost();

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

  const handleRetryPost = useCallback(
    (post: Post) => {
      createPostMutation.mutate({
        communityId: post.communityId,
        title: post.title,
        body: post.body,
        authorName: post.authorName,
        retryPostId: post.id,
      });
    },
    [createPostMutation]
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => <CommunityPostItem post={item} onRetry={handleRetryPost} />,
    [handleRetryPost]
  );

  if (communityQuery.isLoading) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <LoadingIndicator />
      </ThemedView>
    );
  }

  if (communityQuery.isError || !community) {
    return (
      <ThemedView style={[styles.centered, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={[styles.errorBackButton, { top: insets.top + Spacing.md }]}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <ErrorState
          message="Couldn't load this community."
          onRetry={() => communityQuery.refetch()}
        />
      </ThemedView>
    );
  }

  const posts = postsQuery.data ?? [];

  return (
    <FlashList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      refreshing={postsQuery.isRefetching}
      onRefresh={postsQuery.refetch}
      ListHeaderComponent={
        <ThemedView style={styles.headerWrapper}>
          <ThemedView
            style={[
              styles.hero,
              { backgroundColor: theme.accent, paddingTop: insets.top + Spacing.md },
            ]}
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
            <ThemedText type="small" themeColor="onAccent" style={styles.heroDescription}>
              {community.description}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.body}>
            <ThemedView type="surface" elevated style={styles.statsCard}>
              <ThemedView type="surface" style={styles.statItem}>
                <Ionicons name="people" size={20} color={theme.accent} />
                <AnimatedCounter
                  value={community.memberCount}
                  type="title"
                  style={styles.statValue}
                />
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Members
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <ThemedView type="surface" style={styles.statItem}>
                <Ionicons name="chatbubble-ellipses" size={20} color={theme.accent} />
                {postsQuery.isLoading ? (
                  <ThemedText type="title" style={styles.statValue}>
                    —
                  </ThemedText>
                ) : (
                  <AnimatedCounter value={posts.length} type="title" style={styles.statValue} />
                )}
                <ThemedText type="eyebrow" themeColor="textSecondary">
                  Posts
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <Button
              variant={community.isJoined ? 'secondary' : 'primary'}
              danger={membershipFailed}
              loading={membershipPending}
              icon={
                membershipFailed
                  ? undefined
                  : community.isJoined
                    ? 'checkmark-circle'
                    : 'add-circle-outline'
              }
              label={membershipFailed ? 'Retry' : community.isJoined ? 'Leave' : 'Join'}
              onPress={handleToggleMembership}
            />

            <ThemedView style={styles.postsHeadingRow}>
              <ThemedText type="subtitle">Posts</ThemedText>
              {community.isJoined ? (
                <Link href={{ pathname: '/community/[id]/create-post', params: { id } }} asChild>
                  <Pressable
                    style={StyleSheet.flatten([
                      styles.newPostButton,
                      { backgroundColor: theme.surfaceSelected },
                    ])}
                  >
                    <Ionicons name="add" size={16} color={theme.accent} />
                    <ThemedText type="linkPrimary">New Post</ThemedText>
                  </Pressable>
                </Link>
              ) : (
                <ThemedView
                  style={[
                    styles.newPostButton,
                    styles.newPostButtonDisabled,
                    { backgroundColor: theme.surfaceSelected },
                  ]}
                >
                  <Ionicons name="add" size={16} color={theme.textSecondary} />
                  <ThemedText type="linkPrimary" themeColor="textSecondary">
                    New Post
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            {postsQuery.isLoading ? (
              <LoadingIndicator size={32} />
            ) : postsQuery.isError ? (
              <ErrorState message="Couldn't load posts." onRetry={() => postsQuery.refetch()} />
            ) : null}
          </ThemedView>
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
    gap: Spacing.sm,
  },
  errorBackButton: {
    position: 'absolute',
    left: Spacing.lg,
  },
  headerWrapper: {
    gap: 0,
  },
  hero: {
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroDescription: {
    marginTop: Spacing.xs,
    lineHeight: 20,
    opacity: 0.9,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
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
  postsHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  newPostButtonDisabled: {
    opacity: 0.4,
  },
  emptyPosts: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
});
