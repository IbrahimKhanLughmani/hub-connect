import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Post, PostStatus } from '@/types/post';

type CommunityPostItemProps = {
  post: Post;
  onRetry?: (post: Post) => void;
};

function CommunityPostItemComponent({ post, onRetry }: CommunityPostItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">{post.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {post.body}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          {post.authorName}
        </ThemedText>
        {post.status === PostStatus.Pending ? (
          <ThemedText type="small" themeColor="textSecondary">
            Posting…
          </ThemedText>
        ) : post.status === PostStatus.Failed ? (
          <Pressable onPress={() => onRetry?.(post)}>
            <ThemedText type="small" style={{ color: theme.error }}>
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
    borderRadius: 12,
    padding: 16,
    gap: 4,
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
