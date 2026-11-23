'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import { FieldShell, describedBy, inputClass, type FieldBaseProps } from '@/components/ui/form-control';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & FieldBaseProps;

/** Password input with a show / hide toggle. */
export function PasswordField({ label, hint, error, id, className, ...props }: PasswordFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={inputClass(error, `pr-16 ${className ?? ''}`)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </FieldShell>
  );
}
