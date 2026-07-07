import { useQuery } from '@tanstack/react-query';

import { fetchPosts, postsQueryKey } from '@/features/posts/service';

export function usePosts(communityId: string) {
  return useQuery({
    queryKey: postsQueryKey(communityId),
    queryFn: () => fetchPosts(communityId),
  });
}
