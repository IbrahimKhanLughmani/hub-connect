import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useCreatePost } from '@/features/posts/hooks/use-create-post';
import { useDeletePost, useUpdatePost } from '@/features/posts/hooks/use-post-mutations';
import {
  registerCreatePostMutationDefaults,
  registerDeletePostMutationDefaults,
  registerUpdatePostMutationDefaults,
} from '@/features/posts/mutations';
import { createPost, deletePost, postsQueryKey, updatePost } from '@/features/posts/service';
import { Post, PostStatus } from '@/features/posts/types';

jest.mock('@/features/posts/service', () => ({
  ...jest.requireActual('@/features/posts/service'),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
}));

const mockedCreatePost = jest.mocked(createPost);
const mockedUpdatePost = jest.mocked(updatePost);
const mockedDeletePost = jest.mocked(deletePost);

const communityId = 'test-community';

const existingPost: Post = {
  id: 'post-1',
  communityId,
  title: 'Existing post',
  body: 'Already here.',
  authorName: 'Someone',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: PostStatus.Sent,
};

function createTestQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  registerCreatePostMutationDefaults(queryClient);
  registerUpdatePostMutationDefaults(queryClient);
  registerDeletePostMutationDefaults(queryClient);
  return queryClient;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('create post mutation', () => {
  beforeEach(() => {
    mockedCreatePost.mockReset();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('applies an optimistic pending post immediately', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);

    let resolveCreate: (post: Post) => void = () => {};
    mockedCreatePost.mockImplementation(
      () =>
        new Promise<Post>((resolve) => {
          resolveCreate = resolve;
        })
    );

    const { result } = await renderHook(() => useCreatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      communityId,
      title: 'New post',
      body: 'Hello there.',
      authorName: 'Me',
    });

    await waitFor(() => {
      const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
      expect(posts).toHaveLength(2);
      expect(posts[0]).toMatchObject({
        title: 'New post',
        body: 'Hello there.',
        status: PostStatus.Pending,
      });
    });

    const created: Post = {
      id: 'post-2',
      communityId,
      title: 'New post',
      body: 'Hello there.',
      authorName: 'Me',
      createdAt: '2026-01-02T00:00:00.000Z',
      status: PostStatus.Sent,
    };
    resolveCreate(created);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('replaces the pending post with the created post on success', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);

    const created: Post = {
      id: 'post-2',
      communityId,
      title: 'New post',
      body: 'Hello there.',
      authorName: 'Me',
      createdAt: '2026-01-02T00:00:00.000Z',
      status: PostStatus.Sent,
    };
    mockedCreatePost.mockResolvedValue(created);

    const { result } = await renderHook(() => useCreatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      communityId,
      title: 'New post',
      body: 'Hello there.',
      authorName: 'Me',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
    expect(posts).toEqual([created, existingPost]);
  });

  it('marks the pending post as failed when the request errors', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);
    mockedCreatePost.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useCreatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      communityId,
      title: 'New post',
      body: 'Hello there.',
      authorName: 'Me',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
    expect(posts[0]).toMatchObject({ status: PostStatus.Failed });
  });

  it('retrying a failed post reuses the same pending id instead of adding a new entry', async () => {
    const queryClient = createTestQueryClient();
    const failedPost: Post = {
      id: 'optimistic-1',
      communityId,
      title: 'Retry me',
      body: 'Body',
      authorName: 'Me',
      createdAt: '2026-01-02T00:00:00.000Z',
      status: PostStatus.Failed,
    };
    queryClient.setQueryData(postsQueryKey(communityId), [failedPost, existingPost]);

    const created: Post = { ...failedPost, status: PostStatus.Sent };
    mockedCreatePost.mockResolvedValue(created);

    const { result } = await renderHook(() => useCreatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      communityId,
      title: failedPost.title,
      body: failedPost.body,
      authorName: failedPost.authorName,
      retryPostId: failedPost.id,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual(created);
  });

  describe('offline queueing', () => {
    it('pauses the mutation while offline (without calling the service) and resumes once back online', async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);

      const created: Post = {
        id: 'post-2',
        communityId,
        title: 'New post',
        body: 'Hello there.',
        authorName: 'Me',
        createdAt: '2026-01-02T00:00:00.000Z',
        status: PostStatus.Sent,
      };
      mockedCreatePost.mockResolvedValue(created);

      onlineManager.setOnline(false);

      const { result } = await renderHook(() => useCreatePost(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        communityId,
        title: 'New post',
        body: 'Hello there.',
        authorName: 'Me',
      });

      await waitFor(() => expect(result.current.isPaused).toBe(true));
      expect(mockedCreatePost).not.toHaveBeenCalled();

      // The optimistic pending post still applies immediately, even while the
      // actual network call is paused waiting for connectivity.
      const postsWhilePaused = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
      expect(postsWhilePaused[0]).toMatchObject({ title: 'New post', status: PostStatus.Pending });

      onlineManager.setOnline(true);
      await queryClient.resumePausedMutations();

      await waitFor(() =>
        expect(mockedCreatePost).toHaveBeenCalledWith(
          expect.objectContaining({ communityId, title: 'New post' }),
          expect.anything()
        )
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});

describe('update post mutation', () => {
  beforeEach(() => {
    mockedUpdatePost.mockReset();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('applies the edited title and body optimistically', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);

    let resolveUpdate: (post: Post) => void = () => {};
    mockedUpdatePost.mockImplementation(
      () =>
        new Promise<Post>((resolve) => {
          resolveUpdate = resolve;
        })
    );

    const { result } = await renderHook(() => useUpdatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: existingPost.id,
      communityId,
      authorName: existingPost.authorName,
      title: 'Edited title',
      body: 'Edited body',
    });

    await waitFor(() => {
      const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
      expect(posts[0]).toMatchObject({ title: 'Edited title', body: 'Edited body' });
    });

    resolveUpdate({ ...existingPost, title: 'Edited title', body: 'Edited body' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back to the original title and body when the request fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);
    mockedUpdatePost.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useUpdatePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: existingPost.id,
      communityId,
      authorName: existingPost.authorName,
      title: 'Edited title',
      body: 'Edited body',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
    expect(posts).toEqual([existingPost]);
  });

  describe('offline queueing', () => {
    it('pauses the mutation while offline and resumes once back online', async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);
      mockedUpdatePost.mockResolvedValue({
        ...existingPost,
        title: 'Edited title',
        body: 'Edited body',
      });

      onlineManager.setOnline(false);

      const { result } = await renderHook(() => useUpdatePost(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        id: existingPost.id,
        communityId,
        authorName: existingPost.authorName,
        title: 'Edited title',
        body: 'Edited body',
      });

      await waitFor(() => expect(result.current.isPaused).toBe(true));
      expect(mockedUpdatePost).not.toHaveBeenCalled();

      onlineManager.setOnline(true);
      await queryClient.resumePausedMutations();

      await waitFor(() => expect(mockedUpdatePost).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});

describe('delete post mutation', () => {
  beforeEach(() => {
    mockedDeletePost.mockReset();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('removes the post from the cache optimistically', async () => {
    const queryClient = createTestQueryClient();
    const other: Post = { ...existingPost, id: 'post-2' };
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost, other]);

    let resolveDelete: () => void = () => {};
    mockedDeletePost.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );

    const { result } = await renderHook(() => useDeletePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: existingPost.id,
      communityId,
      authorName: existingPost.authorName,
    });

    await waitFor(() => {
      const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
      expect(posts).toEqual([other]);
    });

    resolveDelete();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('restores the deleted post when the request fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);
    mockedDeletePost.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useDeletePost(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: existingPost.id,
      communityId,
      authorName: existingPost.authorName,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const posts = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
    expect(posts).toEqual([existingPost]);
  });

  describe('offline queueing', () => {
    it('pauses the mutation while offline and resumes once back online', async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(postsQueryKey(communityId), [existingPost]);
      mockedDeletePost.mockResolvedValue(undefined);

      onlineManager.setOnline(false);

      const { result } = await renderHook(() => useDeletePost(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        id: existingPost.id,
        communityId,
        authorName: existingPost.authorName,
      });

      await waitFor(() => expect(result.current.isPaused).toBe(true));
      expect(mockedDeletePost).not.toHaveBeenCalled();

      const postsWhilePaused = queryClient.getQueryData<Post[]>(postsQueryKey(communityId)) ?? [];
      expect(postsWhilePaused).toEqual([]);

      onlineManager.setOnline(true);
      await queryClient.resumePausedMutations();

      await waitFor(() => expect(mockedDeletePost).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
