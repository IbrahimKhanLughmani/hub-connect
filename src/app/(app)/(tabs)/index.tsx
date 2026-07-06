import { Ionicons } from '@expo/vector-icons';
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
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [controlsHeight, setControlsHeight] = useState(0);
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

  function handleSelectSort(value: CommunitySort) {
    setSort(value);
    setIsSortMenuOpen(false);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={styles.controls}
        onLayout={(event) => setControlsHeight(event.nativeEvent.layout.height)}
      >
        <ThemedView style={styles.searchRow}>
          <ThemedView style={styles.searchInput}>
            <ThemedTextInput
              icon="search"
              placeholder="Search communities"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>
          <Pressable
            onPress={() => setIsSortMenuOpen((prev) => !prev)}
            style={[
              styles.sortButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons name="swap-vertical" size={20} color={theme.text} />
          </Pressable>
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

      {isSortMenuOpen ? (
        <>
          <Pressable style={styles.overlay} onPress={() => setIsSortMenuOpen(false)} />
          <ThemedView
            type="surface"
            elevated
            style={[
              styles.sortMenu,
              { borderColor: theme.border, top: controlsHeight + Spacing.xs },
            ]}
          >
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sort;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectSort(option.value)}
                  style={styles.sortMenuItem}
                >
                  <ThemedText type="small" style={{ color: active ? theme.accent : theme.text }}>
                    {option.label}
                  </ThemedText>
                  {active ? <Ionicons name="checkmark" size={16} color={theme.accent} /> : null}
                </Pressable>
              );
            })}
          </ThemedView>
        </>
      ) : null}
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
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sortMenu: {
    position: 'absolute',
    right: Spacing.lg,
    minWidth: 160,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
