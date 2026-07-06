import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useCreatePost } from '@/hooks/use-create-post';
import { useDraftPost } from '@/hooks/use-draft-post';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth-store';

type FormErrors = {
  title?: string;
  body?: string;
};

function validate(title: string, body: string): FormErrors {
  const errors: FormErrors = {};

  if (title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  if (body.trim().length === 0) {
    errors.body = 'Body is required';
  }

  return errors;
}

export default function CreatePostScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const email = useAuthStore((state) => state.email);
  const { title, setTitle, body, setBody, clearDraft } = useDraftPost(id);
  const [errors, setErrors] = useState<FormErrors>({});
  const createPostMutation = useCreatePost();

  function handleSubmit() {
    const nextErrors = validate(title, body);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    createPostMutation.mutate({
      communityId: id,
      title: title.trim(),
      body: body.trim(),
      authorName: email ?? 'You',
    });

    clearDraft();
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">New Post</ThemedText>

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
        <Pressable
          disabled={createPostMutation.isPending}
          style={[
            styles.button,
            { backgroundColor: theme.text, opacity: createPostMutation.isPending ? 0.6 : 1 },
          ]}
          onPress={handleSubmit}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            Post
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  form: {
    gap: 16,
  },
  bodyInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
