import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppStackParamList } from '@/app/routes';
import { useAuthStore } from '@/features/auth';
import { useCreatePost, useDraftPost } from '@/features/posts/hooks';
import {
  validateCreatePost,
  type CreatePostFormErrors,
} from '@/features/posts/validate-create-post';
import { Button, ThemedText, ThemedTextInput, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

export function CreatePostScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CreatePost'>>();
  const { id } = route.params;
  const email = useAuthStore((state) => state.email);
  const { title, setTitle, body, setBody, clearDraft } = useDraftPost(id);
  const [errors, setErrors] = useState<CreatePostFormErrors>({});
  const createPostMutation = useCreatePost();

  function handleSubmit() {
    if (createPostMutation.isPending) {
      return;
    }

    const nextErrors = validateCreatePost(title, body);
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
    navigation.goBack();
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
          Share with your community
        </ThemedText>
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
          <Button label="Post" onPress={handleSubmit} loading={createPostMutation.isPending} />
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
