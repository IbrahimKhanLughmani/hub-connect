export enum PostStatus {
  Sent = 'sent',
  Pending = 'pending',
  Failed = 'failed',
}

export interface Post {
  id: string;
  communityId: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
  status: PostStatus;
}
