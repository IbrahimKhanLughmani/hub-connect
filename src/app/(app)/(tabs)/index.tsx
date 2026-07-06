import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { CommunityListItem } from '@/components/community-list-item';
import { ErrorState } from '@/components/error-state';
import { LoadingIndicator } from '@/components/loading-indicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useCommunities } from '@/hooks/use-communities';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { CommunitySort, type Community } from '@/types/community';

const SORT_OPTIONS: { label: string; value: CommunitySort }[] = [
  { label: 'Name', value: CommunitySort.NameAsc },
  { label: 'Members', value: CommunitySort.MembersDesc },
];

export default function CommunitiesScreen() {
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
      <ThemedView style={styles.controls}>
        <ThemedTextInput
          placeholder="Search communities"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedView style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const active = option.value === sort;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSort(option.value)}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: active ? theme.accent : theme.surface,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: active ? theme.onAccent : theme.textSecondary }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>
      </ThemedView>

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
  controls: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sortChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
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
