import { Tabs } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText, ThemeToggleButton } from '@/components';
import { Spacing } from '@/constants';
import { useTheme } from '@/hooks';
import { useAuthStore } from '@/store';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Pressable onPress={logout} hitSlop={8} style={styles.logoutButton}>
      <ThemedText type="link" themeColor="text">
        Log out
      </ThemedText>
    </Pressable>
  );
}

function HomeTabIcon() {
  return (
    <LottieView
      source={require('@/assets/animations/home.json')}
      autoPlay
      loop
      style={styles.tabIcon}
    />
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Communities',
          tabBarIcon: () => <HomeTabIcon />,
          headerLeft: () => <ThemeToggleButton />,
          headerRight: () => <LogoutButton />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: Spacing.lg,
  },
  tabIcon: {
    width: 32,
    height: 32,
  },
});
