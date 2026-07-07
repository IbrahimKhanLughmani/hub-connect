export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Communities: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  CommunityDetails: { id: string };
  CreatePost: { id: string };
};
