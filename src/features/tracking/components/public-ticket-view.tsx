'use client';

import { useState, type FormEvent } from 'react';
import { ErrorState } from '@/components/shared/states';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogoMark } from '@/components/ui/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { TextAreaField } from '@/components/ui/textarea-field';
import { fileTypeLabel, saveBlob } from '@/features/attachments/api';
import { StatusBadge, ticketRef } from '@/features/tickets/components/badges';
import { useQuery } from '@/hooks/use-query';
import { errorMessage, isApiError } from '@/lib/api/client';
import { APP_NAME } from '@/lib/constants/brand';
import { LIMITS, STATUS_CUSTOMER_TEXT, TYPE_LABEL } from '@/lib/constants/tickets';
import { cx, formatDate } from '@/lib/utils';
import type { PublicTicket } from '@/types/api';
import { downloadPublicAttachment, getPublicTicket, postPublicReply } from '../api';
import { BusinessBrand } from './business-brand';

function Shell({ children, brand }: { children: React.ReactNode; brand?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">{brand ?? <Skeleton className="h-10 w-48" />}</div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">{children}</main>
      <footer className="pb-10 text-center text-xs text-subtle">
        <span className="inline-flex items-center gap-1.5">
          <LogoMark className="h-4 w-4" /> Powered by {APP_NAME}
        </span>
      </footer>
    </div>
  );
}

function Reply({ token, onPosted }: { token: string; onPosted: (c: PublicTicket['comments'][number]) => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const trimmed = text.trim();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || trimmed.length > LIMITS.comment) return;
    setBusy(true);
    setError(null);
    try {
      onPosted(await postPublicReply(token, trimmed));
      setText('');
      setSent(true);
    } catch (err) {
      setError(isApiError(err, 429) ? 'You are sending messages too quickly. Please wait a minute.' : errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error ? <Alert>{error}</Alert> : null}
      {sent && !error ? <Alert kind="success">Thanks, your message was added. The team will see it here.</Alert> : null}
      <TextAreaField
        label="Add a message"
        name="reply"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSent(false);
        }}
        placeholder="Add details or answer the team's question…"
        error={trimmed.length > LIMITS.comment ? `Keep it under ${LIMITS.comment} characters.` : undefined}
      />
      <div className="flex justify-end">
        <Button type="submit" loading={busy} disabled={!trimmed}>
          Send message
        </Button>
      </div>
    </form>
  );
}

/** What a customer sees through their tracking link: public information only. */
export function PublicTicketView({ token }: { token: string }) {
  const { data, error, loading, refetch, setData } = useQuery((signal) => getPublicTicket(token, signal), [token]);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (isApiError(error, 404)) {
    return (
      <Shell brand={<LogoMark />}>
        <Card className="text-center">
          <h1 className="text-lg font-semibold">This tracking link no longer works</h1>
          <p className="mt-2 text-sm text-muted">It may have expired or been replaced. Ask the business for a new link on the channel you contacted them on.</p>
        </Card>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        {error ? <ErrorState error={error} onRetry={refetch} /> : null}
        {loading ? <Skeleton className="h-40 w-full" /> : null}
      </Shell>
    );
  }

  const { ticket, organization, contact } = data;
  async function download(id: number, fileName: string) {
    setDownloadError(null);
    try {
      saveBlob(await downloadPublicAttachment(token, id), fileName);
    } catch (err) {
      setDownloadError(errorMessage(err));
    }
  }

  return (
    <Shell brand={<BusinessBrand name={organization.name} logo={organization.logo} />}>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted">
              Request {ticketRef(ticket.ticketNumber)} · {TYPE_LABEL[ticket.type]}
              {ticket.orderRef ? ` · Order ${ticket.orderRef}` : ''}
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">{ticket.title}</h1>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="mt-4 rounded-control bg-primary-soft px-4 py-3 text-sm text-primary">{STATUS_CUSTOMER_TEXT[ticket.status]}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{ticket.description}</p>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <div>
            <dt className="inline">Opened </dt>
            <dd className="inline">{formatDate(ticket.createdAt)}</dd>
          </div>
          <div>
            <dt className="inline">Last update </dt>
            <dd className="inline">{formatDate(ticket.updatedAt)}</dd>
          </div>
          {ticket.resolvedAt ? (
            <div>
              <dt className="inline">Resolved </dt>
              <dd className="inline">{formatDate(ticket.resolvedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      {data.attachments.length > 0 ? (
        <Card>
          <h2 className="text-base font-semibold">Shared files</h2>
          {downloadError ? <Alert className="mt-3">{downloadError}</Alert> : null}
          <ul className="mt-3 divide-y divide-line rounded-control border border-line">
            {data.attachments.map((a) => (
              <li key={a.attachmentId} className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-hover text-[11px] font-semibold text-muted">{fileTypeLabel(a.fileType)}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{a.fileName}</span>
                <Button variant="outline" size="sm" onClick={() => download(a.attachmentId, a.fileName)}>
                  Download
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-base font-semibold">Messages</h2>
        {data.comments.length === 0 ? <p className="mt-3 text-sm text-muted">No messages yet.</p> : null}
        <ol className="mt-4 space-y-5">
          {data.comments.map((c) => {
            const mine = c.authorType === 'CONTACT';
            return (
              <li key={c.commentId} className={cx('flex gap-3', mine && 'flex-row-reverse')}>
                <Avatar name={mine ? contact.name : c.authorName} tone={mine ? 'neutral' : 'primary'} size="sm" />
                <div className={cx('min-w-0 max-w-[85%]', mine && 'text-right')}>
                  <p className="text-xs text-muted">
                    <span className="font-medium text-ink">{mine ? 'You' : `${c.authorName} · ${organization.name}`}</span> · {formatDate(c.createdAt)}
                  </p>
                  <div className={cx('mt-1 inline-block whitespace-pre-wrap break-words rounded-card px-4 py-2.5 text-left text-sm leading-6', mine ? 'bg-primary text-on-primary' : 'border border-line bg-surface text-ink')}>{c.text}</div>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-6 border-t border-line pt-5">
          {data.canReply ? (
            <Reply token={token} onPosted={(c) => setData((d) => (d ? { ...d, comments: [...d.comments, c] } : d))} />
          ) : (
            <p className="text-sm text-muted">This request is closed. Contact {organization.name} again if you need more help.</p>
          )}
        </div>
      </Card>
      <p className="text-center text-xs text-subtle">Keep this link private: anyone with it can see this request. It works until {formatDate(data.linkExpiresAt)}.</p>
    </Shell>
  );
}
