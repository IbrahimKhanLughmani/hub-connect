import { QueryClient } from '@tanstack/react-query';

import { createPost, deletePost, postsQueryKey, updatePost } from '@/features/posts/service';
import { Post, PostStatus } from '@/features/posts/types';

export const CREATE_POST_MUTATION_KEY = ['createPost'];

export type CreatePostInput = {
  communityId: string;
  title: string;
  body: string;
  authorName: string;
  retryPostId?: string;
};

type CreatePostMutationContext = {
  pendingId: string;
  communityId: string;
};

export function registerCreatePostMutationDefaults(queryClient: QueryClient) {
  queryClient.setMutationDefaults(CREATE_POST_MUTATION_KEY, {
    mutationFn: createPost,
    onMutate: async (input: CreatePostInput): Promise<CreatePostMutationContext> => {
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
    onSuccess: (createdPost: Post, _input: CreatePostInput, context) => {
      const postContext = context as CreatePostMutationContext | undefined;
      if (!postContext) return;
      const key = postsQueryKey(postContext.communityId);
      queryClient.setQueryData<Post[]>(key, (previous = []) =>
        previous.map((post) => (post.id === postContext.pendingId ? createdPost : post))
      );
    },
    onError: (_error, _input: CreatePostInput, context) => {
      const postContext = context as CreatePostMutationContext | undefined;
      if (!postContext) return;
      const key = postsQueryKey(postContext.communityId);
      queryClient.setQueryData<Post[]>(key, (previous = []) =>
        previous.map((post) =>
          post.id === postContext.pendingId ? { ...post, status: PostStatus.Failed } : post
        )
      );
    },
  });
}

export const UPDATE_POST_MUTATION_KEY = ['updatePost'];
export const DELETE_POST_MUTATION_KEY = ['deletePost'];

export type UpdatePostInput = {
  id: string;
  communityId: string;
  authorName: string;
  title: string;
  body: string;
};

export type DeletePostInput = {
  id: string;
  communityId: string;
  authorName: string;
};

type PostListMutationContext = { previous?: Post[] };

function registerPostListMutation<TInput extends { communityId: string }>(
  queryClient: QueryClient,
  mutationKey: readonly unknown[],
  action: (input: TInput) => Promise<Post | void>,
  applyOptimistic: (posts: Post[], input: TInput) => Post[]
) {
  queryClient.setMutationDefaults(mutationKey, {
    mutationFn: action,
    onMutate: async (input: TInput): Promise<PostListMutationContext> => {
      const key = postsQueryKey(input.communityId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Post[]>(key);

      queryClient.setQueryData<Post[]>(key, (posts = []) => applyOptimistic(posts, input));

      return { previous };
    },
    onError: (_error, input: TInput, context) => {
      const postContext = context as PostListMutationContext | undefined;
      if (postContext?.previous) {
        queryClient.setQueryData(postsQueryKey(input.communityId), postContext.previous);
      }
    },
  });
}

export function registerUpdatePostMutationDefaults(queryClient: QueryClient) {
  registerPostListMutation<UpdatePostInput>(
    queryClient,
    UPDATE_POST_MUTATION_KEY,
    updatePost,
    (posts, input) =>
      posts.map((post) =>
        post.id === input.id ? { ...post, title: input.title, body: input.body } : post
      )
  );
}

export function registerDeletePostMutationDefaults(queryClient: QueryClient) {
  registerPostListMutation<DeletePostInput>(
    queryClient,
    DELETE_POST_MUTATION_KEY,
    deletePost,
    (posts, input) => posts.filter((post) => post.id !== input.id)
  );
}
