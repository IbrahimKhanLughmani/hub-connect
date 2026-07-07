import { useMutation } from '@tanstack/react-query';

import { CREATE_POST_MUTATION_KEY, type CreatePostInput } from '@/features/posts/mutations';
import { Post } from '@/features/posts/types';

type CreatePostMutationContext = {
  pendingId: string;
  communityId: string;
};

export function useCreatePost() {
  return useMutation<Post, unknown, CreatePostInput, CreatePostMutationContext>({
    mutationKey: CREATE_POST_MUTATION_KEY,
  });
}
