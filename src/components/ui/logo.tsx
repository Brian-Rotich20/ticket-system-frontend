import { APP_NAME } from '@/lib/constants/brand';
import { cx } from '@/lib/utils';

/** Product mark: a chat bubble with a check. Colors come from the design tokens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cx('h-8 w-8', className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M9 10.5A2.5 2.5 0 0 1 11.5 8h9A2.5 2.5 0 0 1 23 10.5v7a2.5 2.5 0 0 1-2.5 2.5H15l-4.2 3.4c-.6.5-1.3.1-1.3-.6V20A2.5 2.5 0 0 1 9 17.5Z" className="fill-surface" />
      <path d="m12.5 14 2.3 2.3 4.7-4.6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-secondary" />
    </svg>
  );
}

/** Mark + name. `inverted` for use on the navy brand color. */
export function Logo({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={inverted ? '[&>rect]:fill-on-primary [&>path:first-of-type]:fill-primary' : undefined} />
      <span className={cx('text-lg font-semibold tracking-tight', inverted ? 'text-on-primary' : 'text-primary')}>{APP_NAME}</span>
    </span>
  );
}
