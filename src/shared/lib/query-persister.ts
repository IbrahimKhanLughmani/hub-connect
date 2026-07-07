import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import { storage } from '@/shared/lib/storage';

export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
  },
});
