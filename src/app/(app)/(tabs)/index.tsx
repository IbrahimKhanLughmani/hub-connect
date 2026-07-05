import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/auth-store';

export default function CommunitiesScreen() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Communities</ThemedText>
      <ThemedText type="small">Community list coming in the next step.</ThemedText>
      <Pressable onPress={logout}>
        <ThemedText type="link">Log out</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
