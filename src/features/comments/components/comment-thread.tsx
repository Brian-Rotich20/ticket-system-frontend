'use client';

import { useRef, useState } from 'react';
import { ErrorState, LoadingRows } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useUser } from '@/context/auth-context';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { plural } from '@/lib/utils';
import type { Comment } from '@/types/api';
import { listComments } from '../api';
import { CommentComposer } from './comment-composer';
import { CommentItem } from './comment-item';

/**
 * Oldest first, 50 at a time, with "load more" for long conversations. Remount (change `key`) to reload.
 */
export function CommentThread({ ticketId, closed }: { ticketId: number; closed: boolean }) {
  const user = useUser();
  const endRef = useRef<HTMLDivElement>(null);
  const first = useQuery((signal) => listComments(ticketId, 1, signal), [ticketId]);
  const [extra, setExtra] = useState<{ items: Comment[]; page: number }>({ items: [], page: 1 });
  const [posted, setPosted] = useState<Comment[]>([]);
  const [moreBusy, setMoreBusy] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);

  const data = first.data;
  const items = data ? [...data.items, ...extra.items, ...posted.filter((p) => !extra.items.some((e) => e.commentId === p.commentId))] : [];
  const total = data ? data.total + posted.length : 0;
  const hasMore = data ? extra.page < data.totalPages : false;

  async function loadMore() {
    setMoreBusy(true);
    setMoreError(null);
    try {
      const next = await listComments(ticketId, extra.page + 1);
      setExtra((x) => ({ items: [...x.items, ...next.items], page: x.page + 1 }));
    } catch (err) {
      setMoreError(errorMessage(err));
    } finally {
      setMoreBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Conversation" description={data ? plural(total, 'message') : undefined} />
      {first.error ? <ErrorState error={first.error} onRetry={first.refetch} /> : null}
      {first.loading && !data ? <LoadingRows rows={2} className="h-14" /> : null}
      {data && items.length === 0 ? (
        <p className="rounded-control bg-canvas px-4 py-6 text-center text-sm text-muted">No messages yet. Reply to the customer or add an internal note below.</p>
      ) : null}

      {items.length > 0 ? (
        <ol aria-label="Conversation" className="space-y-5">
          {items.map((c) => (
            <CommentItem key={c.commentId} comment={c} isOwn={c.authorId === user.id} />
          ))}
        </ol>
      ) : null}

      {hasMore ? (
        <div className="mt-4 text-center">
          {moreError ? <p className="mb-2 text-sm text-danger">{moreError}</p> : null}
          <Button variant="outline" size="sm" loading={moreBusy} onClick={loadMore}>
            Load more messages ({total - items.length} more)
          </Button>
        </div>
      ) : null}
      <div ref={endRef} />

      <div className="mt-6">
        {closed ? (
          <p className="rounded-control bg-canvas p-4 text-sm text-muted">This ticket is closed, so new messages cannot be added.</p>
        ) : (
          <CommentComposer
            ticketId={ticketId}
            onPosted={(c) => {
              setPosted((p) => [...p, c]);
              requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
            }}
          />
        )}
      </div>
    </Card>
  );
}
