import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchCommunities } from '@/services/communities';
import { CommunitySort } from '@/types/community';

export function useCommunities(params: { search: string; sort: CommunitySort }) {
  return useInfiniteQuery({
    queryKey: ['communities', params.search, params.sort],
    queryFn: ({ pageParam }) =>
      fetchCommunities({ page: pageParam, search: params.search, sort: params.sort }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
