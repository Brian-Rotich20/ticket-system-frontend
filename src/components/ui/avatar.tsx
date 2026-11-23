import { cx } from '@/lib/utils';

type AvatarProps = {
  name: string;
  tone?: 'primary' | 'secondary' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

const TONE = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-secondary-soft text-success',
  neutral: 'bg-hover text-muted',
} as const;

export function Avatar({ name, tone = 'neutral', size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cx('flex shrink-0 items-center justify-center rounded-full font-semibold', size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs', TONE[tone], className)}
    >
      {initials(name)}
    </span>
  );
}
