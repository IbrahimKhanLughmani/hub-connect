import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { CommunitySort } from '@/features/communities/types';
import { ThemedText, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';

type SortOption = { label: string; value: CommunitySort };

type SortMenuProps = {
  options: SortOption[];
  selectedValue: CommunitySort;
  topOffset: number;
  onSelect: (value: CommunitySort) => void;
  onClose: () => void;
};

export function SortMenu({ options, selectedValue, topOffset, onSelect, onClose }: SortMenuProps) {
  const theme = useTheme();

  return (
    <>
      <Pressable style={styles.overlay} onPress={onClose} />
      <ThemedView
        type="surface"
        elevated
        style={[styles.menu, { borderColor: theme.border, top: topOffset }]}
      >
        {options.map((option) => {
          const active = option.value === selectedValue;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={styles.menuItem}
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  menu: {
    position: 'absolute',
    right: Spacing.lg,
    minWidth: 160,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    zIndex: 11,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
