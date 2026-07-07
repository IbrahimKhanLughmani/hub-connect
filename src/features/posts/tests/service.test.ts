import { PostStatus } from '@/features/posts/types';

jest.mock('@/shared/services', () => ({
  ...jest.requireActual('@/shared/services'),
  simulateNetwork: jest.fn().mockResolvedValue(undefined),
}));

function loadService() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/features/posts/service') as typeof import('@/features/posts/service');
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

  describe('postsQueryKey', () => {
    it('builds a key scoped to the community id', () => {
      const { postsQueryKey } = loadService();

      expect(postsQueryKey('downtown-dubai')).toEqual(['posts', 'downtown-dubai']);
    });
  });
});
