import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Post, PostStatus } from '@/types/post';
import { formatRelativeTime } from '@/utils/format-relative-time';

type CommunityPostItemProps = {
  post: Post;
  onRetry?: (post: Post) => void;
};

function CommunityPostItemComponent({ post, onRetry }: CommunityPostItemProps) {
  const theme = useTheme();

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
        <Pressable onPress={() => onRetry?.(post)} style={styles.status}>
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
