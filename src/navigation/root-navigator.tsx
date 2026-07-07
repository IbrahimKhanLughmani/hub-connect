import { AppNavigator } from '@/navigation/app-navigator';
import { AuthNavigator } from '@/navigation/auth-navigator';
import { AuthStatus, useAuthStore } from '@/store';

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  return status === AuthStatus.Authenticated ? <AppNavigator /> : <AuthNavigator />;
}
