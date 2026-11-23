'use client';

import { useId } from 'react';
import { FieldShell, inputClass } from '@/components/ui/form-control';

type SearchInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
};

export function SearchInput({ label, value, onChange, placeholder, hideLabel }: SearchInputProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel}>
      <div className="relative">
        <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle">
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" strokeLinecap="round" />
        </svg>
        <input
          id={id}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(undefined, 'pl-9 pr-9')}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-lg leading-none text-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
          >
            ×
          </button>
        ) : null}
      </div>
    </FieldShell>
  );
}
