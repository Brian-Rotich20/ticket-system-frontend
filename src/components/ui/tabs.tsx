import { cx } from '@/lib/utils';

type TabOption<T extends string> = { value: T; label: string };

type TabsProps<T extends string> = {
  label: string;
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
};

/** Segmented control. */
export function Tabs<T extends string>({ label, value, options, onChange }: TabsProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-control border border-line bg-hover p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-[calc(var(--radius-control)-2px)] px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary',
            o.value === value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
