import { CommunitySort } from '@/features/communities/types';

jest.mock('@/shared/services', () => ({
  ...jest.requireActual('@/shared/services'),
  simulateNetwork: jest.fn().mockResolvedValue(undefined),
}));

// Loaded dynamically (post jest.resetModules()) alongside the service so that thrown ApiError
// instances share the same class identity as the ApiError re-required in each test.
function loadApiError() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/shared/services/api-error') as typeof import('@/shared/services/api-error');
}

function loadService() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/features/communities/service') as typeof import('@/features/communities/service');
}

describe('communities service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('fetchCommunities', () => {
    it('paginates using a fixed page size and reports the next page', async () => {
      const { fetchCommunities } = loadService();

      const firstPage = await fetchCommunities({ page: 1 });
      expect(firstPage.items).toHaveLength(10);
      expect(firstPage.nextPage).toBe(2);

      const lastPage = await fetchCommunities({ page: 3 });
      expect(lastPage.items.length).toBeGreaterThan(0);
      expect(lastPage.nextPage).toBeNull();
    });

    it('filters by search term across name and description, case-insensitively', async () => {
      const { fetchCommunities } = loadService();

      const byName = await fetchCommunities({ page: 1, search: 'dubai marina' });
      expect(byName.items.map((c) => c.id)).toEqual(['dubai-marina']);

      const byDescription = await fetchCommunities({ page: 1, search: 'polo greens' });
      expect(byDescription.items.map((c) => c.id)).toEqual(['arabian-ranches']);
    });

    it('sorts alphabetically by default (NameAsc)', async () => {
      const { fetchCommunities } = loadService();

      const result = await fetchCommunities({ page: 1, sort: CommunitySort.NameAsc });
      const names = result.items.map((c) => c.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('sorts by member count descending when MembersDesc is requested', async () => {
      const { fetchCommunities } = loadService();

      const result = await fetchCommunities({ page: 1, sort: CommunitySort.MembersDesc });
      const counts = result.items.map((c) => c.memberCount);
      expect(counts).toEqual([...counts].sort((a, b) => b - a));
    });
  });

  describe('fetchCommunity', () => {
    it('returns the matching community', async () => {
      const { fetchCommunity } = loadService();

      const community = await fetchCommunity('downtown-dubai');
      expect(community.id).toBe('downtown-dubai');
    });

    it('throws a NotFound ApiError for an unknown id', async () => {
      const { fetchCommunity } = loadService();
      const { ApiError, ApiErrorKind } = loadApiError();

      await expect(fetchCommunity('does-not-exist')).rejects.toMatchObject({
        kind: ApiErrorKind.NotFound,
      });
      await expect(fetchCommunity('does-not-exist')).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('joinCommunity', () => {
    it('marks the community as joined and increments the member count', async () => {
      const { fetchCommunity, joinCommunity } = loadService();

      const before = await fetchCommunity('dubai-marina');
      const after = await joinCommunity('dubai-marina');

      expect(after.isJoined).toBe(true);
      expect(after.memberCount).toBe(before.memberCount + 1);
    });

    it('throws a NotFound ApiError for an unknown id', async () => {
      const { joinCommunity } = loadService();
      const { ApiErrorKind } = loadApiError();

      await expect(joinCommunity('does-not-exist')).rejects.toMatchObject({
        kind: ApiErrorKind.NotFound,
      });
    });
  });

  describe('leaveCommunity', () => {
    it('marks the community as not joined and decrements the member count', async () => {
      const { fetchCommunity, leaveCommunity } = loadService();

      const before = await fetchCommunity('downtown-dubai');
      const after = await leaveCommunity('downtown-dubai');

      expect(after.isJoined).toBe(false);
      expect(after.memberCount).toBe(before.memberCount - 1);
    });

    it('never decrements the member count below zero', async () => {
      const { leaveCommunity } = loadService();
      type DummyDataModule = typeof import('@/features/communities/dummy-data');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { communities } = require('@/features/communities/dummy-data') as DummyDataModule;

      const target = communities.find((c) => c.id === 'rashid-yachts-marina');
      if (!target) throw new Error('fixture community not found');
      target.memberCount = 0;

      const result = await leaveCommunity('rashid-yachts-marina');

      expect(result.memberCount).toBe(0);
    });

    it('throws a NotFound ApiError for an unknown id', async () => {
      const { leaveCommunity } = loadService();
      const { ApiErrorKind } = loadApiError();

      await expect(leaveCommunity('does-not-exist')).rejects.toMatchObject({
        kind: ApiErrorKind.NotFound,
      });
    });
  });

  describe('query key factories', () => {
    it('builds a stable communities list key from search + sort', () => {
      const { communitiesQueryKey, COMMUNITIES_QUERY_KEY } = loadService();

      const key = communitiesQueryKey({ search: 'dubai', sort: CommunitySort.NameAsc });
      expect(key).toEqual([...COMMUNITIES_QUERY_KEY, 'dubai', CommunitySort.NameAsc]);
    });

    it('builds a community detail key from the id', () => {
      const { communityQueryKey } = loadService();

      expect(communityQueryKey('downtown-dubai')).toEqual(['community', 'downtown-dubai']);
    });
  });
});
