import { posts } from '@/features/posts/dummy-data';
import { Post, PostStatus } from '@/features/posts/types';
import { simulateNetwork } from '@/shared/services';

export function postsQueryKey(communityId: string) {
  return ['posts', communityId] as const;
}

let nextId = posts.length + 1;

export async function fetchPosts(communityId: string): Promise<Post[]> {
  await simulateNetwork(500);

  return posts
    .filter((post) => post.communityId === communityId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createPost(input: {
  communityId: string;
  title: string;
  body: string;
  authorName: string;
}): Promise<Post> {
  await simulateNetwork(600);

  const post: Post = {
    id: `post-${nextId++}`,
    communityId: input.communityId,
    title: input.title,
    body: input.body,
    authorName: input.authorName,
    createdAt: new Date().toISOString(),
    status: PostStatus.Sent,
  };

  posts.unshift(post);

  return post;
}
