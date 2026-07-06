import { useQuery } from '@tanstack/react-query';

import { communityQueryKey } from '@/lib';
import { fetchCommunity } from '@/services';

export function useCommunity(id: string) {
  return useQuery({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
  });
}
