'use client';

import { useCommandCenter } from '../../lib/command-center/store';
import { LoadingState } from '../StateViews';

export function FeedbackBar() {
  const error = useCommandCenter((s) => s.error);
  const notice = useCommandCenter((s) => s.notice);
  const busy = useCommandCenter((s) => s.busy);
  const phase = useCommandCenter((s) => s.phase);
  return <>
    {error && <div className="error mb-4">{error}</div>}
    {notice && <div className="notice mb-4">{notice}</div>}
    {busy && <LoadingState message={phase} />}
  </>;
}
