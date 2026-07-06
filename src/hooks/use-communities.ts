import { useInfiniteQuery } from '@tanstack/react-query';

import { communitiesQueryKey } from '@/lib';
import { fetchCommunities } from '@/services';
import { CommunitySort } from '@/types';

export function useCommunities(params: { search: string; sort: CommunitySort }) {
  return useInfiniteQuery({
    queryKey: communitiesQueryKey(params),
    queryFn: ({ pageParam }) =>
      fetchCommunities({ page: pageParam, search: params.search, sort: params.sort }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
