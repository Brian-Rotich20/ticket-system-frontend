import type { ReactNode } from 'react';
import { cx } from '@/lib/utils';

export type FieldBaseProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
};

export function inputClass(error?: string, className?: string) {
  return cx(
    'mt-1.5 block w-full rounded-control border bg-surface px-3 py-2 text-sm text-ink placeholder:text-subtle',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-hover disabled:text-muted',
    error ? 'border-danger' : 'border-line-strong',
    className,
  );
}

/** Links the control to its hint/error text for screen readers. */
export function describedBy(id: string, hint?: ReactNode, error?: string) {
  return error || hint ? `${id}-msg` : undefined;
}

type FieldShellProps = FieldBaseProps & { id: string; children: ReactNode };

export function FieldShell({ id, label, hint, error, hideLabel, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className={cx('block text-sm font-medium text-ink', hideLabel && 'sr-only')}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-msg`} className="mt-1 text-xs text-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
