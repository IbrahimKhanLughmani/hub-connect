import { useQuery } from '@tanstack/react-query';

import { postsQueryKey } from '@/lib/query-keys';
import { fetchPosts } from '@/services/posts';

export function usePosts(communityId: string) {
  return useQuery({
    queryKey: postsQueryKey(communityId),
    queryFn: () => fetchPosts(communityId),
  });
}
