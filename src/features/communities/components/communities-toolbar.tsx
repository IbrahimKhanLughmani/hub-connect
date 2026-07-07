import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SortMenu } from '@/features/communities/components/sort-menu';
import { CommunitySort } from '@/features/communities/types';
import { ThemedTextInput, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';

const SORT_OPTIONS: { label: string; value: CommunitySort }[] = [
  { label: 'Name', value: CommunitySort.NameAsc },
  { label: 'Members', value: CommunitySort.MembersDesc },
];

type CommunitiesToolbarProps = {
  search: string;
  onSearchChange: (text: string) => void;
  sort: CommunitySort;
  onSortChange: (sort: CommunitySort) => void;
};

export function CommunitiesToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: CommunitiesToolbarProps) {
  const theme = useTheme();
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [rowHeight, setRowHeight] = useState(0);

  function handleSelectSort(value: CommunitySort) {
    onSortChange(value);
    setIsSortMenuOpen(false);
  }

  return (
    // Fragment root (not a wrapping View) so SortMenu's full-screen overlay is a
    // sibling of this toolbar in the parent, not clipped to the toolbar's own height.
    <>
      <ThemedView
        style={styles.controls}
        onLayout={(event) => setRowHeight(event.nativeEvent.layout.height)}
      >
        <ThemedView style={styles.searchRow}>
          <ThemedView style={styles.searchInput}>
            <ThemedTextInput
              icon="search"
              placeholder="Search communities"
              value={search}
              onChangeText={onSearchChange}
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

      {isSortMenuOpen ? (
        <SortMenu
          options={SORT_OPTIONS}
          selectedValue={sort}
          topOffset={rowHeight + Spacing.xs}
          onSelect={handleSelectSort}
          onClose={() => setIsSortMenuOpen(false)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
});
