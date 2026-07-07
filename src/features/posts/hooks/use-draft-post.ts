import { useEffect, useState } from 'react';

import { storage } from '@/shared/lib';

type Draft = {
  title: string;
  body: string;
};

function draftKey(communityId: string) {
  return `draft-post-${communityId}`;
}

function readDraft(communityId: string): Draft {
  const raw = storage.getString(draftKey(communityId));
  if (!raw) {
    return { title: '', body: '' };
  }

  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return { title: '', body: '' };
  }
}

export function useDraftPost(communityId: string) {
  const [title, setTitle] = useState(() => readDraft(communityId).title);
  const [body, setBody] = useState(() => readDraft(communityId).body);

  useEffect(() => {
    if (title || body) {
      storage.set(draftKey(communityId), JSON.stringify({ title, body }));
    } else {
      storage.remove(draftKey(communityId));
    }
  }, [communityId, title, body]);

  function clearDraft() {
    setTitle('');
    setBody('');
    storage.remove(draftKey(communityId));
  }

  return { title, setTitle, body, setBody, clearDraft };
}
