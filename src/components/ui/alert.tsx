import type { ReactNode } from 'react';
import { cx } from '@/lib/utils';

type AlertProps = {
  kind?: 'error' | 'info' | 'success' | 'warning';
  children: ReactNode;
  className?: string;
};

const STYLE = {
  error: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-info-soft text-info border-info/20',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
} as const;

export function Alert({ kind = 'error', children, className }: AlertProps) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cx('rounded-control border px-3 py-2 text-sm', STYLE[kind], className)}>
      {children}
    </div>
  );
}
