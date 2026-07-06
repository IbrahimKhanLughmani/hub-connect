import { CommunitySort } from '@/types';

export const COMMUNITIES_QUERY_KEY = ['communities'] as const;

export function communitiesQueryKey(params: { search: string; sort: CommunitySort }) {
  return [...COMMUNITIES_QUERY_KEY, params.search, params.sort] as const;
}

export function communityQueryKey(id: string) {
  return ['community', id] as const;
}

export function postsQueryKey(communityId: string) {
  return ['posts', communityId] as const;
}
