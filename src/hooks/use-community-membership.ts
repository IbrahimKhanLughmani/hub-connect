import { useMutation } from '@tanstack/react-query';

import { JOIN_COMMUNITY_MUTATION_KEY, LEAVE_COMMUNITY_MUTATION_KEY } from '@/lib';
import { Community } from '@/types';

type MembershipMutationContext = { previous?: Community };

export function useJoinCommunity() {
  return useMutation<Community, unknown, string, MembershipMutationContext>({
    mutationKey: JOIN_COMMUNITY_MUTATION_KEY,
  });
}

export function useLeaveCommunity() {
  return useMutation<Community, unknown, string, MembershipMutationContext>({
    mutationKey: LEAVE_COMMUNITY_MUTATION_KEY,
  });
}
