import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postsQueryKey } from '@/lib/query-keys';
import { createPost } from '@/services/posts';
import { Post, PostStatus } from '@/types/post';

type CreatePostInput = {
  communityId: string;
  title: string;
  body: string;
  authorName: string;
  retryPostId?: string;
};

type MutationContext = {
  pendingId: string;
  communityId: string;
};

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<Post, unknown, CreatePostInput, MutationContext>({
    mutationFn: (input) => createPost(input),
    onMutate: async (input) => {
      const key = postsQueryKey(input.communityId);
      await queryClient.cancelQueries({ queryKey: key });

      const pendingId = input.retryPostId ?? `optimistic-${Date.now()}`;
      const optimisticPost: Post = {
        id: pendingId,
        communityId: input.communityId,
        title: input.title,
        body: input.body,
        authorName: input.authorName,
        createdAt: new Date().toISOString(),
        status: PostStatus.Pending,
      };

      queryClient.setQueryData<Post[]>(key, (previous = []) =>
        input.retryPostId
          ? previous.map((post) => (post.id === pendingId ? optimisticPost : post))
          : [optimisticPost, ...previous]
      );

      return { pendingId, communityId: input.communityId };
    },
    onSuccess: (createdPost, _input, context) => {
      const key = postsQueryKey(context.communityId);
      queryClient.setQueryData<Post[]>(key, (previous = []) =>
        previous.map((post) => (post.id === context.pendingId ? createdPost : post))
      );
    },
    onError: (_error, _input, context) => {
      if (!context) return;
      const key = postsQueryKey(context.communityId);
      queryClient.setQueryData<Post[]>(key, (previous = []) =>
        previous.map((post) =>
          post.id === context.pendingId ? { ...post, status: PostStatus.Failed } : post
        )
      );
    },
  });
}
