import { useQuery } from '@tanstack/react-query';

import { communityQueryKey } from '@/lib/query-keys';
import { fetchCommunity } from '@/services/communities';

export function useCommunity(id: string) {
  return useQuery({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
  });
}
