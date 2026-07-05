import { Redirect, Stack } from 'expo-router';

import { AuthStatus, useAuthStore } from '@/store/auth-store';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === AuthStatus.Authenticated) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
