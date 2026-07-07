import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TabsNavigator } from '@/app/routes/tabs-navigator';
import type { AppStackParamList } from '@/app/routes/types';
import { CommunityDetailsScreen } from '@/features/communities';
import { CreatePostScreen } from '@/features/posts';
import { useTheme } from '@/shared/hooks';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}
    >
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="CommunityDetails" component={CommunityDetailsScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}
