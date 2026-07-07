import { StyleSheet } from 'react-native';

import { CommunityHero } from '@/features/communities/components/community-hero';
import { CommunityStatsCard } from '@/features/communities/components/community-stats-card';
import { MembershipButton } from '@/features/communities/components/membership-button';
import type { Community } from '@/features/communities/types';
import { NewPostLink } from '@/features/posts';
import { ErrorState, LoadingIndicator, ThemedText, ThemedView } from '@/shared/components';
import { Spacing } from '@/shared/styles';

type CommunityDetailsHeaderProps = {
  community: Community;
  topInset: number;
  postCount: number;
  isPostsLoading: boolean;
  isPostsError: boolean;
  onRetryPosts: () => void;
  isMembershipPending: boolean;
  isMembershipFailed: boolean;
  onToggleMembership: () => void;
};

export function CommunityDetailsHeader({
  community,
  topInset,
  postCount,
  isPostsLoading,
  isPostsError,
  onRetryPosts,
  isMembershipPending,
  isMembershipFailed,
  onToggleMembership,
}: CommunityDetailsHeaderProps) {
  return (
    <ThemedView style={styles.wrapper}>
      <CommunityHero community={community} topInset={topInset} />

      <ThemedView style={styles.body}>
        <CommunityStatsCard
          memberCount={community.memberCount}
          postCount={postCount}
          isPostCountLoading={isPostsLoading}
        />

        <MembershipButton
          isJoined={community.isJoined}
          isPending={isMembershipPending}
          isFailed={isMembershipFailed}
          onPress={onToggleMembership}
        />

        <ThemedView style={styles.postsHeadingRow}>
          <ThemedText type="subtitle">Posts</ThemedText>
          <NewPostLink communityId={community.id} isJoined={community.isJoined} />
        </ThemedView>

        {isPostsLoading ? (
          <LoadingIndicator size={32} />
        ) : isPostsError ? (
          <ErrorState message="Couldn't load posts." onRetry={onRetryPosts} />
        ) : null}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  body: {
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.lg,
  },
  postsHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
});
