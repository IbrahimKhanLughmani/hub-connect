import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Post } from '@/types/post';

type CommunityPostItemProps = {
  post: Post;
};

function CommunityPostItemComponent({ post }: CommunityPostItemProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold">{post.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {post.body}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {post.authorName}
      </ThemedText>
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
});
