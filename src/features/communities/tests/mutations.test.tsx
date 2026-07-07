import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useJoinCommunity, useLeaveCommunity } from '@/features/communities/hooks';
import { registerMembershipMutationDefaults } from '@/features/communities/mutations';
import {
  COMMUNITIES_QUERY_KEY,
  communityQueryKey,
  joinCommunity,
  leaveCommunity,
} from '@/features/communities/service';
import type { Community } from '@/features/communities/types';

jest.mock('@/features/communities/service', () => ({
  ...jest.requireActual('@/features/communities/service'),
  joinCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
}));

const mockedJoin = jest.mocked(joinCommunity);
const mockedLeave = jest.mocked(leaveCommunity);

const baseCommunity: Community = {
  id: 'test-community',
  name: 'Test Community',
  description: 'A community used for tests.',
  memberCount: 10,
  isJoined: false,
};

function createTestQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  registerMembershipMutationDefaults(queryClient);
  return queryClient;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('community membership mutations', () => {
  beforeEach(() => {
    mockedJoin.mockReset();
    mockedLeave.mockReset();
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('applies an optimistic update immediately when joining', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(communityQueryKey(baseCommunity.id), baseCommunity);

    let resolveJoin: (community: Community) => void = () => {};
    mockedJoin.mockImplementation(
      () =>
        new Promise<Community>((resolve) => {
          resolveJoin = resolve;
        })
    );

    const { result } = await renderHook(() => useJoinCommunity(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(baseCommunity.id);

    await waitFor(() => {
      expect(queryClient.getQueryData<Community>(communityQueryKey(baseCommunity.id))).toEqual({
        ...baseCommunity,
        isJoined: true,
        memberCount: baseCommunity.memberCount + 1,
      });
    });

    resolveJoin({ ...baseCommunity, isJoined: true, memberCount: baseCommunity.memberCount + 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back the optimistic update when the join request fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(communityQueryKey(baseCommunity.id), baseCommunity);
    mockedJoin.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useJoinCommunity(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(baseCommunity.id);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData<Community>(communityQueryKey(baseCommunity.id))).toEqual(
      baseCommunity
    );
  });

  it('rolls back the optimistic update when the leave request fails', async () => {
    const joinedCommunity: Community = { ...baseCommunity, isJoined: true, memberCount: 11 };
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(communityQueryKey(joinedCommunity.id), joinedCommunity);
    mockedLeave.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useLeaveCommunity(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(joinedCommunity.id);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData<Community>(communityQueryKey(joinedCommunity.id))).toEqual(
      joinedCommunity
    );
  });

  it('invalidates the community and communities-list caches once the mutation settles', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(communityQueryKey(baseCommunity.id), baseCommunity);
    mockedJoin.mockResolvedValue({ ...baseCommunity, isJoined: true, memberCount: 11 });

    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useJoinCommunity(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(baseCommunity.id);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: communityQueryKey(baseCommunity.id) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: COMMUNITIES_QUERY_KEY });
  });

  describe('offline queueing', () => {
    it('pauses the mutation while offline (without calling the service) and resumes once back online', async () => {
      const queryClient = createTestQueryClient();
      queryClient.setQueryData(communityQueryKey(baseCommunity.id), baseCommunity);
      mockedJoin.mockResolvedValue({ ...baseCommunity, isJoined: true, memberCount: 11 });

      onlineManager.setOnline(false);

      const { result } = await renderHook(() => useJoinCommunity(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(baseCommunity.id);

      await waitFor(() => expect(result.current.isPaused).toBe(true));
      expect(mockedJoin).not.toHaveBeenCalled();

      // The optimistic update still applies immediately, even while the actual
      // network call is paused waiting for connectivity.
      expect(queryClient.getQueryData<Community>(communityQueryKey(baseCommunity.id))).toEqual({
        ...baseCommunity,
        isJoined: true,
        memberCount: baseCommunity.memberCount + 1,
      });

      onlineManager.setOnline(true);
      await queryClient.resumePausedMutations();

      await waitFor(() =>
        expect(mockedJoin).toHaveBeenCalledWith(baseCommunity.id, expect.anything())
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
