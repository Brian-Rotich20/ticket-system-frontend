import type { ReactNode } from 'react';
import { cx } from '@/lib/utils';

type CardProps = {
  className?: string;
  /** Removes the inner padding (tables and lists that run edge to edge). */
  flush?: boolean;
  children: ReactNode;
};

export function Card({ className, flush, children }: CardProps) {
  return <div className={cx('rounded-card border border-line bg-surface', !flush && 'p-5 sm:p-6', className)}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
