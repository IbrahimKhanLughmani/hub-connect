import { communities } from '@/features/communities/dummy-data';
import { Community, CommunitySort } from '@/features/communities/types';
import { ApiError, ApiErrorKind, simulateNetwork } from '@/shared/services';
import { PaginatedResult } from '@/shared/types';

const PAGE_SIZE = 10;

export const COMMUNITIES_QUERY_KEY = ['communities'] as const;

export function communitiesQueryKey(params: { search: string; sort: CommunitySort }) {
  return [...COMMUNITIES_QUERY_KEY, params.search, params.sort] as const;
}

export function communityQueryKey(id: string) {
  return ['community', id] as const;
}

export async function fetchCommunities(params: {
  page: number;
  search?: string;
  sort?: CommunitySort;
}): Promise<PaginatedResult<Community>> {
  await simulateNetwork(600);

  const search = params.search?.trim().toLowerCase();
  const filtered = search
    ? communities.filter(
        (community) =>
          community.name.toLowerCase().includes(search) ||
          community.description.toLowerCase().includes(search)
      )
    : communities;

  const sorted = [...filtered].sort((a, b) =>
    params.sort === CommunitySort.MembersDesc
      ? b.memberCount - a.memberCount
      : a.name.localeCompare(b.name)
  );

  const start = (params.page - 1) * PAGE_SIZE;
  const items = sorted.slice(start, start + PAGE_SIZE);
  const hasNextPage = start + PAGE_SIZE < sorted.length;

  return {
    items,
    nextPage: hasNextPage ? params.page + 1 : null,
    totalCount: sorted.length,
  };
}

export async function fetchCommunity(id: string): Promise<Community> {
  await simulateNetwork(500);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  return { ...community };
}

export async function joinCommunity(id: string): Promise<Community> {
  await simulateNetwork(400);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  community.isJoined = true;
  community.memberCount += 1;

  return { ...community };
}

export async function leaveCommunity(id: string): Promise<Community> {
  await simulateNetwork(400);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  community.isJoined = false;
  community.memberCount = Math.max(0, community.memberCount - 1);

  return { ...community };
}
