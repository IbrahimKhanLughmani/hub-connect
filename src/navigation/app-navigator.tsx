import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@/hooks';
import { TabsNavigator } from '@/navigation/tabs-navigator';
import type { AppStackParamList } from '@/navigation/types';
import { CommunityDetailsScreen, CreatePostScreen } from '@/screens';

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
