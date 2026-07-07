import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '@/app/routes';
import { CommunityDetailsHeader } from '@/features/communities/components';
import { useCommunity, useJoinCommunity, useLeaveCommunity } from '@/features/communities/hooks';
import { CommunityPostItem, useCreatePost, usePosts, type Post } from '@/features/posts';
import {
  ErrorBoundary,
  ErrorState,
  LoadingIndicator,
  ThemedText,
  ThemedView,
} from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

function CommunityDetailsContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CommunityDetails'>>();
  const { id } = route.params;

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
          onPress={() => navigation.goBack()}
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
        <CommunityDetailsHeader
          community={community}
          topInset={insets.top}
          postCount={posts.length}
          isPostsLoading={postsQuery.isLoading}
          isPostsError={postsQuery.isError}
          onRetryPosts={() => postsQuery.refetch()}
          isMembershipPending={membershipPending}
          isMembershipFailed={membershipFailed}
          onToggleMembership={handleToggleMembership}
        />
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

export function CommunityDetailsScreen() {
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
  emptyPosts: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
});
