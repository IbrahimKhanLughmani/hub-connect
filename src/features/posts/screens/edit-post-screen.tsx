import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '@/app/routes';
import { useUpdatePost, usePosts } from '@/features/posts/hooks';
import {
  validateCreatePost,
  type CreatePostFormErrors,
} from '@/features/posts/validate-create-post';
import { Button, ThemedText, ThemedTextInput, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

export function EditPostScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'EditPost'>>();
  const { communityId, postId } = route.params;

  const postsQuery = usePosts(communityId);
  const post = postsQuery.data?.find((item) => item.id === postId);

  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [errors, setErrors] = useState<CreatePostFormErrors>({});
  const updatePostMutation = useUpdatePost();

  function handleSubmit() {
    if (!post || updatePostMutation.isPending) {
      return;
    }

    const nextErrors = validateCreatePost(title, body);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    updatePostMutation.mutate({
      id: post.id,
      communityId,
      authorName: post.authorName,
      title: title.trim(),
      body: body.trim(),
    });

    navigation.goBack();
  }

  if (!post) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText type="small" themeColor="textSecondary">
          This post is no longer available.
        </ThemedText>
        <Button variant="secondary" label="Go back" onPress={() => navigation.goBack()} />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedView
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>

        <ThemedText type="eyebrow" themeColor="textSecondary">
          Editing your post
        </ThemedText>
        <ThemedText type="title">Edit Post</ThemedText>

        <ThemedView style={styles.form}>
          <ThemedTextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            placeholder="What's on your mind?"
          />
          <ThemedTextInput
            label="Body"
            value={body}
            onChangeText={setBody}
            error={errors.body}
            placeholder="Share the details"
            multiline
            numberOfLines={4}
            style={styles.bodyInput}
          />
          <Button label="Save" onPress={handleSubmit} loading={updatePostMutation.isPending} />
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  bodyInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
