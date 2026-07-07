import { PostStatus } from '@/features/posts/types';

jest.mock('@/shared/services', () => ({
  ...jest.requireActual('@/shared/services'),
  simulateNetwork: jest.fn().mockResolvedValue(undefined),
}));

function loadService() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/features/posts/service') as typeof import('@/features/posts/service');
}

// Loaded dynamically (post jest.resetModules()) alongside the service so that thrown ApiError
// instances share the same class identity as the ApiError re-required in each test.
function loadApiError() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/shared/services/api-error') as typeof import('@/shared/services/api-error');
}

describe('posts service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('fetchPosts', () => {
    it('returns only posts for the requested community', async () => {
      const { fetchPosts } = loadService();

      const posts = await fetchPosts('downtown-dubai');

      expect(posts.length).toBeGreaterThan(0);
      expect(posts.every((post) => post.communityId === 'downtown-dubai')).toBe(true);
    });

    it('returns an empty array for a community with no posts', async () => {
      const { fetchPosts } = loadService();

      const posts = await fetchPosts('does-not-exist');

      expect(posts).toEqual([]);
    });

    it('sorts posts newest first', async () => {
      const { fetchPosts } = loadService();

      const posts = await fetchPosts('downtown-dubai');
      const timestamps = posts.map((post) => new Date(post.createdAt).getTime());

      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    });
  });

  describe('createPost', () => {
    it('creates a post with Sent status and prepends it to the feed', async () => {
      const { fetchPosts, createPost } = loadService();

      const before = await fetchPosts('downtown-dubai');
      const created = await createPost({
        communityId: 'downtown-dubai',
        title: 'New post',
        body: 'Body text',
        authorName: 'test.user',
      });

      expect(created.status).toBe(PostStatus.Sent);
      expect(created.title).toBe('New post');

      const after = await fetchPosts('downtown-dubai');
      expect(after).toHaveLength(before.length + 1);
      expect(after[0].id).toBe(created.id);
    });

    it('assigns each new post a unique, incrementing id', async () => {
      const { createPost } = loadService();

      const first = await createPost({
        communityId: 'downtown-dubai',
        title: 'First',
        body: 'Body',
        authorName: 'test.user',
      });
      const second = await createPost({
        communityId: 'downtown-dubai',
        title: 'Second',
        body: 'Body',
        authorName: 'test.user',
      });

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('updatePost', () => {
    it('updates the title and body of the matching post', async () => {
      const { fetchPosts, updatePost } = loadService();

      const [target] = await fetchPosts('downtown-dubai');
      const updated = await updatePost({
        id: target.id,
        authorName: target.authorName,
        title: 'Updated title',
        body: 'Updated body',
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.body).toBe('Updated body');
    });

    it('throws a NotFound ApiError for an unknown id', async () => {
      const { updatePost } = loadService();
      const { ApiErrorKind } = loadApiError();

      await expect(
        updatePost({ id: 'does-not-exist', authorName: 'anyone', title: 'x', body: 'y' })
      ).rejects.toMatchObject({ kind: ApiErrorKind.NotFound });
    });

    it('throws a Forbidden ApiError when the author does not match', async () => {
      const { fetchPosts, updatePost } = loadService();
      const { ApiErrorKind } = loadApiError();

      const [target] = await fetchPosts('downtown-dubai');

      await expect(
        updatePost({ id: target.id, authorName: 'someone-else', title: 'x', body: 'y' })
      ).rejects.toMatchObject({ kind: ApiErrorKind.Forbidden });
    });
  });

  describe('deletePost', () => {
    it('removes the matching post from the feed', async () => {
      const { fetchPosts, deletePost } = loadService();

      const before = await fetchPosts('downtown-dubai');
      const [target] = before;
      await deletePost({ id: target.id, authorName: target.authorName });

      const after = await fetchPosts('downtown-dubai');
      expect(after).toHaveLength(before.length - 1);
      expect(after.some((post) => post.id === target.id)).toBe(false);
    });

    it('throws a NotFound ApiError for an unknown id', async () => {
      const { deletePost } = loadService();
      const { ApiErrorKind } = loadApiError();

      await expect(
        deletePost({ id: 'does-not-exist', authorName: 'anyone' })
      ).rejects.toMatchObject({ kind: ApiErrorKind.NotFound });
    });

    it('throws a Forbidden ApiError when the author does not match', async () => {
      const { fetchPosts, deletePost } = loadService();
      const { ApiErrorKind } = loadApiError();

      const [target] = await fetchPosts('downtown-dubai');

      await expect(deletePost({ id: target.id, authorName: 'someone-else' })).rejects.toMatchObject(
        { kind: ApiErrorKind.Forbidden }
      );
    });
  });

  describe('postsQueryKey', () => {
    it('builds a key scoped to the community id', () => {
      const { postsQueryKey } = loadService();

      expect(postsQueryKey('downtown-dubai')).toEqual(['posts', 'downtown-dubai']);
    });
  });
});
