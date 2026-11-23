'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icons';
import { Tabs } from '@/components/ui/tabs';
import { TextAreaField } from '@/components/ui/textarea-field';
import { errorMessage } from '@/lib/api/client';
import { LIMITS } from '@/lib/constants/tickets';
import { cx } from '@/lib/utils';
import type { Comment, Visibility } from '@/types/api';
import { addComment } from '../api';

const MODES: { value: Visibility; label: string }[] = [
  { value: 'PUBLIC', label: 'Reply to customer' },
  { value: 'INTERNAL', label: 'Internal note' },
];

/** Staff composer. The visibility is always an explicit choice and the box changes look with it. */
export function CommentComposer({ ticketId, onPosted }: { ticketId: number; onPosted: (c: Comment) => void }) {
  const [mode, setMode] = useState<Visibility>('PUBLIC');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const trimmed = text.trim();
  const tooLong = trimmed.length > LIMITS.comment;
  const internal = mode === 'INTERNAL';

  async function submit() {
    if (!trimmed || tooLong || busy) return;
    setBusy(true);
    setError(null);
    try {
      onPosted(await addComment(ticketId, trimmed, mode));
      setText('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={onSubmit} className={cx('space-y-3 rounded-card border p-4', internal ? 'border-note/30 bg-note-soft' : 'border-line bg-canvas')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs label="Message type" value={mode} options={MODES} onChange={setMode} />
        <p className={cx('flex items-center gap-1.5 text-xs', internal ? 'text-note' : 'text-muted')}>
          <Icon name={internal ? 'lock' : 'globe'} className="h-3.5 w-3.5" />
          {internal ? 'Only your team can see internal notes.' : 'Visible to the customer on their tracking page.'}
        </p>
      </div>
      {error && <Alert>{error}</Alert>}
      <TextAreaField
        label={internal ? 'Internal note' : 'Reply to customer'}
        hideLabel
        name="comment"
        rows={3}
        placeholder={internal ? 'Notes for your team: courier refs, checks done, next steps…' : 'Write the reply your customer will see…'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        error={tooLong ? `Keep it under ${LIMITS.comment} characters.` : undefined}
        hint="Press Ctrl+Enter to send. Replies are recorded here; they are not sent to WhatsApp or other channels."
      />
      <div className="flex justify-end">
        <Button type="submit" variant={internal ? 'outline' : 'primary'} loading={busy} disabled={!trimmed || tooLong}>
          {internal ? 'Add note' : 'Send reply'}
        </Button>
      </div>
    </form>
  );
}
