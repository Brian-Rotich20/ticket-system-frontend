import { cx } from "@/lib/utils";

type TabOption<T extends string> = {
  value: T;
  label: string;
};

type TabsProps<T extends string> = {
  label: string;
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ label, value, options, onChange }: TabsProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-600",
            o.value === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}