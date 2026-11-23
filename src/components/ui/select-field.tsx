import type { SelectHTMLAttributes } from 'react';
import { FieldShell, describedBy, inputClass, type FieldBaseProps } from '@/components/ui/form-control';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & FieldBaseProps;

export function SelectField({ label, hint, error, hideLabel, id, className, children, ...props }: SelectFieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <select id={inputId} aria-invalid={error ? true : undefined} aria-describedby={describedBy(inputId, hint, error)} className={inputClass(error, className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
