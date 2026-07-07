import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '@/app/routes';
import { useAuthStore } from '@/features/auth';
import { CommunityDetailsHeader } from '@/features/communities/components';
import { useCommunity, useJoinCommunity, useLeaveCommunity } from '@/features/communities/hooks';
import {
  CommunityPostItem,
  useCreatePost,
  useDeletePost,
  usePosts,
  type Post,
} from '@/features/posts';
import {
  ConfirmDialog,
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
  const email = useAuthStore((state) => state.email);

  const communityQuery = useCommunity(id);
  const postsQuery = usePosts(id);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const community = communityQuery.data;
  const membershipPending = joinMutation.isPending || leaveMutation.isPending;
  const membershipFailed = joinMutation.isError || leaveMutation.isError;

  function handleToggleMembership() {
    if (!community || membershipPending) return;

    if (community.isJoined) {
      setShowLeaveConfirm(true);
    } else {
      joinMutation.mutate(community.id);
    }
  }

  function handleCancelLeave() {
    setShowLeaveConfirm(false);
  }

  function handleConfirmLeave() {
    if (!community) return;

    leaveMutation.mutate(community.id);
    setShowLeaveConfirm(false);
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

  const handleEditPost = useCallback(
    (post: Post) => {
      navigation.navigate('EditPost', { communityId: post.communityId, postId: post.id });
    },
    [navigation]
  );

  const handleDeletePost = useCallback((post: Post) => {
    setPostPendingDelete(post);
  }, []);

  function handleCancelDelete() {
    setPostPendingDelete(null);
  }

  function handleConfirmDelete() {
    if (!postPendingDelete) return;

    deletePostMutation.mutate({
      id: postPendingDelete.id,
      communityId: postPendingDelete.communityId,
      authorName: postPendingDelete.authorName,
    });
    setPostPendingDelete(null);
  }

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <CommunityPostItem
        post={item}
        isOwnPost={!!email && item.authorName === email}
        onRetry={handleRetryPost}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    ),
    [email, handleRetryPost, handleEditPost, handleDeletePost]
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
          accessibilityRole="button"
          accessibilityLabel="Go back"
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
    <>
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

      <ConfirmDialog
        visible={!!postPendingDelete}
        title="Delete post?"
        message="This can’t be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ConfirmDialog
        visible={showLeaveConfirm}
        title="Leave community?"
        message={`You’ll stop seeing posts from ${community.name}.`}
        confirmLabel="Leave"
        destructive
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </>
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
