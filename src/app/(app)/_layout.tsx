import { Redirect, Stack } from 'expo-router';

import { AuthStatus, useAuthStore } from '@/store/auth-store';

export default function AppLayout() {
  const status = useAuthStore((state) => state.status);

  if (status !== AuthStatus.Authenticated) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
