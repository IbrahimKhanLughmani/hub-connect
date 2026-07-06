import { useMutation, useQueryClient } from '@tanstack/react-query';

import { communityQueryKey } from '@/hooks/use-community';
import { joinCommunity, leaveCommunity } from '@/services/communities';
import { Community } from '@/types/community';

function useMembershipMutation(
  action: (id: string) => Promise<Community>,
  applyOptimistic: (community: Community) => Community
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: communityQueryKey(id) });
      const previous = queryClient.getQueryData<Community>(communityQueryKey(id));

      if (previous) {
        queryClient.setQueryData<Community>(communityQueryKey(id), applyOptimistic(previous));
      }

      return { previous };
    },
    onError: (_error, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityQueryKey(id), context.previous);
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useJoinCommunity() {
  return useMembershipMutation(joinCommunity, (community) => ({
    ...community,
    isJoined: true,
    memberCount: community.memberCount + 1,
  }));
}

export function useLeaveCommunity() {
  return useMembershipMutation(leaveCommunity, (community) => ({
    ...community,
    isJoined: false,
    memberCount: Math.max(0, community.memberCount - 1),
  }));
}
