import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { CommunitiesToolbar, CommunityListItem } from '@/features/communities/components';
import { useCommunities } from '@/features/communities/hooks';
import { CommunitySort, type Community } from '@/features/communities/types';
import { ErrorState, LoadingIndicator, ThemedText, ThemedView } from '@/shared/components';
import { useDebouncedValue, useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

export function CommunitiesScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CommunitySort>(CommunitySort.NameAsc);
  const debouncedSearch = useDebouncedValue(search, 300);

  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunities({ search: debouncedSearch, sort });

  const communities = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const renderItem = useCallback(
    ({ item }: { item: Community }) => <CommunityListItem community={item} />,
    []
  );

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  return (
    <ThemedView style={styles.container}>
      <CommunitiesToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {isLoading ? (
        <ThemedView style={styles.centered}>
          <LoadingIndicator />
        </ThemedView>
      ) : isError ? (
        <ThemedView style={styles.centered}>
          <ErrorState
            message="Something went wrong loading communities."
            onRetry={() => refetch()}
          />
        </ThemedView>
      ) : communities.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText type="small" themeColor="textSecondary">
            No communities found.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlashList
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ThemedView style={styles.footer}>
                <LoadingIndicator size={32} />
              </ThemedView>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.md,
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
