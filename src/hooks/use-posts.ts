import { useQuery } from '@tanstack/react-query';

import { postsQueryKey } from '@/lib';
import { fetchPosts } from '@/services';

export function usePosts(communityId: string) {
  return useQuery({
    queryKey: postsQueryKey(communityId),
    queryFn: () => fetchPosts(communityId),
  });
}
