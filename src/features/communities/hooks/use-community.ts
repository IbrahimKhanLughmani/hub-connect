import { useQuery } from '@tanstack/react-query';

import { communityQueryKey, fetchCommunity } from '@/features/communities/service';

export function useCommunity(id: string) {
  return useQuery({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
  });
}
