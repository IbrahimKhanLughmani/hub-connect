import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LottieView from 'lottie-react-native';
import { Pressable, StyleSheet } from 'react-native';

import type { MainTabParamList } from '@/app/routes/types';
import { useAuthStore } from '@/features/auth';
import { CommunitiesScreen } from '@/features/communities';
import { ThemedText, ThemeToggleButton } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Spacing } from '@/shared/styles';

const Tab = createBottomTabNavigator<MainTabParamList>();

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

export function TabsNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTitleStyle: { color: theme.text },
        headerShadowVisible: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      <Tab.Screen
        name="Communities"
        component={CommunitiesScreen}
        options={{
          title: 'Communities',
          tabBarIcon: () => <HomeTabIcon />,
          headerLeft: () => <ThemeToggleButton />,
          headerRight: () => <LogoutButton />,
        }}
      />
    </Tab.Navigator>
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
