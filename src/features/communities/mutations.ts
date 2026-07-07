import { QueryClient } from '@tanstack/react-query';

import {
  COMMUNITIES_QUERY_KEY,
  communityQueryKey,
  joinCommunity,
  leaveCommunity,
} from '@/features/communities/service';
import { Community } from '@/features/communities/types';

export const JOIN_COMMUNITY_MUTATION_KEY = ['joinCommunity'];
export const LEAVE_COMMUNITY_MUTATION_KEY = ['leaveCommunity'];

type MembershipMutationContext = { previous?: Community };

function applyJoin(community: Community): Community {
  return { ...community, isJoined: true, memberCount: community.memberCount + 1 };
}

function applyLeave(community: Community): Community {
  return {
    ...community,
    isJoined: false,
    memberCount: Math.max(0, community.memberCount - 1),
  };
}

function registerMembershipMutation(
  queryClient: QueryClient,
  mutationKey: readonly unknown[],
  action: (id: string) => Promise<Community>,
  applyOptimistic: (community: Community) => Community
) {
  queryClient.setMutationDefaults(mutationKey, {
    mutationFn: action,
    onMutate: async (id: string): Promise<MembershipMutationContext> => {
      await queryClient.cancelQueries({ queryKey: communityQueryKey(id) });
      const previous = queryClient.getQueryData<Community>(communityQueryKey(id));

      if (previous) {
        queryClient.setQueryData<Community>(communityQueryKey(id), applyOptimistic(previous));
      }

      return { previous };
    },
    onError: (_error, id: string, context) => {
      const membershipContext = context as MembershipMutationContext | undefined;
      if (membershipContext?.previous) {
        queryClient.setQueryData(communityQueryKey(id), membershipContext.previous);
      }
    },
    onSettled: (_data, _error, id: string) => {
      queryClient.invalidateQueries({ queryKey: communityQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: COMMUNITIES_QUERY_KEY });
    },
  });
}

export function registerMembershipMutationDefaults(queryClient: QueryClient) {
  registerMembershipMutation(queryClient, JOIN_COMMUNITY_MUTATION_KEY, joinCommunity, applyJoin);
  registerMembershipMutation(queryClient, LEAVE_COMMUNITY_MUTATION_KEY, leaveCommunity, applyLeave);
}
