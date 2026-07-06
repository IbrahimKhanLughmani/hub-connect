import { Tabs } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/store/auth-store';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Pressable onPress={logout} hitSlop={8} style={styles.logoutButton}>
      <ThemedText type="link">Log out</ThemedText>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Communities', headerRight: () => <LogoutButton /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
  },
});
