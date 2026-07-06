import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { CommunityListItem } from '@/components/community-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
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
                  { backgroundColor: active ? theme.text : theme.backgroundElement },
                ]}
              >
                <ThemedText type="small" style={{ color: active ? theme.background : theme.text }}>
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator color={theme.text} />
        </ThemedView>
      ) : isError ? (
        <ThemedView style={styles.centered}>
          <ThemedText type="small">Something went wrong loading communities.</ThemedText>
          <Pressable onPress={() => refetch()}>
            <ThemedText type="linkPrimary">Retry</ThemedText>
          </Pressable>
        </ThemedView>
      ) : communities.length === 0 ? (
        <ThemedView style={styles.centered}>
          <ThemedText type="small">No communities found.</ThemedText>
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
                <ActivityIndicator color={theme.text} />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
