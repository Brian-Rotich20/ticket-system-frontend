import type { ReactNode } from 'react';
import type { Tone } from '@/lib/constants/tickets';
import { cx } from '@/lib/utils';

/** The only place tones turn into colors. */
const TONE: Record<Tone, string> = {
  neutral: 'bg-hover text-muted',
  primary: 'bg-primary-soft text-primary',
  secondary: 'bg-secondary-soft text-success',
  info: 'bg-info-soft text-info',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  note: 'bg-note-soft text-note',
};

export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', TONE[tone], className)}>{children}</span>;
}
