import { ApiError, ApiErrorKind } from '@/shared/services/api-error';
import { delay } from '@/shared/utils';

const FAILURE_RATE = 0.1;

export async function simulateNetwork(ms = 500): Promise<void> {
  await delay(ms);

  if (Math.random() < FAILURE_RATE) {
    throw new ApiError(ApiErrorKind.Network, 'Network request failed');
  }
}
