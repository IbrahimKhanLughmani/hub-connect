import { posts } from '@/features/posts/dummy-data';
import { Post, PostStatus } from '@/features/posts/types';
import { ApiError, ApiErrorKind, simulateNetwork } from '@/shared/services';

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

export async function updatePost(input: {
  id: string;
  authorName: string;
  title: string;
  body: string;
}): Promise<Post> {
  await simulateNetwork(500);

  const post = posts.find((item) => item.id === input.id);
  if (!post) {
    throw new ApiError(ApiErrorKind.NotFound, `Post "${input.id}" not found`);
  }
  if (post.authorName !== input.authorName) {
    throw new ApiError(ApiErrorKind.Forbidden, 'You can only edit your own posts');
  }

  post.title = input.title;
  post.body = input.body;

  return { ...post };
}

export async function deletePost(input: { id: string; authorName: string }): Promise<void> {
  await simulateNetwork(400);

  const index = posts.findIndex((item) => item.id === input.id);
  if (index === -1) {
    throw new ApiError(ApiErrorKind.NotFound, `Post "${input.id}" not found`);
  }
  if (posts[index].authorName !== input.authorName) {
    throw new ApiError(ApiErrorKind.Forbidden, 'You can only delete your own posts');
  }

  posts.splice(index, 1);
}
