import { AppNavigator } from '@/app/routes/app-navigator';
import { AuthNavigator } from '@/app/routes/auth-navigator';
import { AuthStatus, useAuthStore } from '@/features/auth';

export function RootNavigator() {
  const status = useAuthStore((state) => state.status);

  return status === AuthStatus.Authenticated ? <AppNavigator /> : <AuthNavigator />;
}
