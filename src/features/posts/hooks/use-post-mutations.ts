import { useMutation } from '@tanstack/react-query';

import {
  DELETE_POST_MUTATION_KEY,
  UPDATE_POST_MUTATION_KEY,
  type DeletePostInput,
  type UpdatePostInput,
} from '@/features/posts/mutations';
import { Post } from '@/features/posts/types';

type PostListMutationContext = { previous?: Post[] };

export function useUpdatePost() {
  return useMutation<Post, unknown, UpdatePostInput, PostListMutationContext>({
    mutationKey: UPDATE_POST_MUTATION_KEY,
  });
}

export function useDeletePost() {
  return useMutation<void, unknown, DeletePostInput, PostListMutationContext>({
    mutationKey: DELETE_POST_MUTATION_KEY,
  });
}
