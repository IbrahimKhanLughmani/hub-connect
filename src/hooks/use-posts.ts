import { useQuery } from '@tanstack/react-query';

import { fetchPosts } from '@/services/posts';

export function postsQueryKey(communityId: string) {
  return ['posts', communityId] as const;
}

export function usePosts(communityId: string) {
  return useQuery({
    queryKey: postsQueryKey(communityId),
    queryFn: () => fetchPosts(communityId),
  });
}
