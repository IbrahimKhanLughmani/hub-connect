import { useInfiniteQuery } from '@tanstack/react-query';

import { communitiesQueryKey, fetchCommunities } from '@/features/communities/service';
import { CommunitySort } from '@/features/communities/types';

export function useCommunities(params: { search: string; sort: CommunitySort }) {
  return useInfiniteQuery({
    queryKey: communitiesQueryKey(params),
    queryFn: ({ pageParam }) =>
      fetchCommunities({ page: pageParam, search: params.search, sort: params.sort }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
