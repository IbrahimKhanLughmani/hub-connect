import { Button } from '@/shared/components';

type MembershipButtonProps = {
  isJoined: boolean;
  isPending: boolean;
  isFailed: boolean;
  onPress: () => void;
};

export function MembershipButton({
  isJoined,
  isPending,
  isFailed,
  onPress,
}: MembershipButtonProps) {
  return (
    <Button
      variant={isJoined ? 'secondary' : 'primary'}
      danger={isFailed}
      loading={isPending}
      icon={isFailed ? undefined : isJoined ? 'checkmark-circle' : 'add-circle-outline'}
      label={isFailed ? 'Retry' : isJoined ? 'Leave' : 'Join'}
      accessibilityLabel={
        isFailed ? 'Retry joining community' : isJoined ? 'Leave community' : 'Join community'
      }
      onPress={onPress}
    />
  );
}
