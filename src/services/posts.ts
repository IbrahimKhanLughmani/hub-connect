import { simulateNetwork } from '@/services/network-simulation';
import { Post, PostStatus } from '@/types/post';

let posts: Post[] = [
  {
    id: 'post-1',
    communityId: 'react-native-developers',
    title: 'New Architecture migration notes',
    body: 'Just finished migrating our app to the New Architecture. Happy to share what broke and what didn’t.',
    authorName: 'jordan.k',
    createdAt: '2026-06-28T09:15:00.000Z',
    status: PostStatus.Sent,
  },
  {
    id: 'post-2',
    communityId: 'react-native-developers',
    title: 'Best library for list virtualization in 2026?',
    body: 'FlashList vs FlatList vs LegendList — what is everyone actually shipping with these days?',
    authorName: 'priya.s',
    createdAt: '2026-06-30T14:02:00.000Z',
    status: PostStatus.Sent,
  },
  {
    id: 'post-3',
    communityId: 'sourdough-bakers',
    title: 'My starter finally doubled!',
    body: 'Three weeks of feeding twice a day and it finally happened. Recipe in the comments.',
    authorName: 'marcus.b',
    createdAt: '2026-06-29T07:40:00.000Z',
    status: PostStatus.Sent,
  },
  {
    id: 'post-4',
    communityId: 'houseplant-parents',
    title: 'Yellow leaves on my monstera — overwatering?',
    body: 'Bottom leaves are turning yellow one at a time. Soil still feels damp after a week.',
    authorName: 'elena.v',
    createdAt: '2026-07-01T11:20:00.000Z',
    status: PostStatus.Sent,
  },
  {
    id: 'post-5',
    communityId: 'houseplant-parents',
    title: 'Propagation station show and tell',
    body: 'Sharing my little propagation shelf — pothos, philodendron, and a stubborn fiddle leaf.',
    authorName: 'sam.r',
    createdAt: '2026-07-02T16:45:00.000Z',
    status: PostStatus.Sent,
  },
  {
    id: 'post-6',
    communityId: 'urban-gardening',
    title: 'Balcony tomato harvest',
    body: 'Six pots, one balcony, more cherry tomatoes than I know what to do with.',
    authorName: 'noah.t',
    createdAt: '2026-06-27T18:10:00.000Z',
    status: PostStatus.Sent,
  },
];

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

  posts = [post, ...posts];

  return post;
}
