import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Post, PostStatus } from '@/types/post';

type CommunityPostItemProps = {
  post: Post;
  onRetry?: (post: Post) => void;
};

function CommunityPostItemComponent({ post, onRetry }: CommunityPostItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="surface" elevated style={styles.container}>
      <ThemedText type="smallBold">{post.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
        {post.body}
      </ThemedText>
      <ThemedView type="surface" style={styles.footer}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {post.authorName}
        </ThemedText>
        {post.status === PostStatus.Pending ? (
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Posting…
          </ThemedText>
        ) : post.status === PostStatus.Failed ? (
          <Pressable onPress={() => onRetry?.(post)}>
            <ThemedText type="eyebrow" style={{ color: theme.error }}>
              Failed · Retry
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>
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
  body: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
