import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/hooks';
import { AuthStatus, useAuthStore } from '@/store';

export default function AppLayout() {
  const theme = useTheme();
  const status = useAuthStore((state) => state.status);

  if (status !== AuthStatus.Authenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}
    />
  );
}
