export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
}

export enum CommunitySort {
  NameAsc = 'name-asc',
  MembersDesc = 'members-desc',
}
