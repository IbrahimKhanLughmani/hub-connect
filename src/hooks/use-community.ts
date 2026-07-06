import { useQuery } from '@tanstack/react-query';

import { fetchCommunity } from '@/services/communities';

export function communityQueryKey(id: string) {
  return ['community', id] as const;
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
  });
}
