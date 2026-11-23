import type { ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, LinkButton } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/lib/api/client';
import { cx } from '@/lib/utils';

/** A failed request, with a retry. */
export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <Alert className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{errorMessage(error)}</span>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </Alert>
  );
}

/** Nothing to show yet. */
export function EmptyState({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center', className)}>
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Placeholder rows while a list loads. */
export function LoadingRows({ rows = 4, className = 'h-12' }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={cx('w-full', className)} />
      ))}
    </div>
  );
}

/** 404 card: missing, or belonging to another organization (the API answers the same for both). */
export function NotFoundCard({ title, description, backHref, backLabel }: { title: string; description: string; backHref: string; backLabel: string }) {
  return (
    <div className="mx-auto max-w-md rounded-card border border-line bg-surface p-8 text-center">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-5 flex justify-center">
        <LinkButton href={backHref} variant="outline">
          {backLabel}
        </LinkButton>
      </div>
    </div>
  );
}
