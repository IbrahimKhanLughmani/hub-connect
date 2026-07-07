import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Post, PostStatus } from '@/features/posts/types';
import { Avatar, ThemedText, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';
import { formatRelativeTime } from '@/shared/utils';

type CommunityPostItemProps = {
  post: Post;
  isOwnPost?: boolean;
  onRetry?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
};

function CommunityPostItemComponent({
  post,
  isOwnPost,
  onRetry,
  onEdit,
  onDelete,
}: CommunityPostItemProps) {
  const theme = useTheme();
  const canManage = isOwnPost && post.status === PostStatus.Sent;

  return (
    <ThemedView type="surface" elevated style={styles.container}>
      <ThemedView type="surface" style={styles.header}>
        <Avatar name={post.authorName} size={40} />

        <ThemedView type="surface" style={styles.authorInfo}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {post.authorName}
          </ThemedText>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            {formatRelativeTime(post.createdAt)}
          </ThemedText>
        </ThemedView>

        {canManage ? (
          <ThemedView type="surface" style={styles.actions}>
            <Pressable
              onPress={() => onEdit?.(post)}
              hitSlop={8}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Edit post"
            >
              <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => onDelete?.(post)}
              hitSlop={8}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Delete post"
            >
              <Ionicons name="trash-outline" size={16} color={theme.error} />
            </Pressable>
          </ThemedView>
        ) : null}
      </ThemedView>

      <ThemedText type="smallBold" style={styles.title}>
        {post.title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
        {post.body}
      </ThemedText>

      {post.status === PostStatus.Pending ? (
        <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.status}>
          Posting…
        </ThemedText>
      ) : post.status === PostStatus.Failed ? (
        <Pressable
          onPress={() => onRetry?.(post)}
          style={styles.status}
          accessibilityRole="button"
          accessibilityLabel="Retry posting"
        >
          <ThemedText type="eyebrow" style={{ color: theme.error }}>
            Failed · Retry
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

export const CommunityPostItem = memo(CommunityPostItemComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: 4,
  },
  title: {
    marginTop: 2,
  },
  body: {
    lineHeight: 20,
  },
  status: {
    marginTop: Spacing.xs,
  },
});
