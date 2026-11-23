import type { TextareaHTMLAttributes } from 'react';
import { FieldShell, describedBy, inputClass, type FieldBaseProps } from '@/components/ui/form-control';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldBaseProps;

export function TextAreaField({ label, hint, error, hideLabel, id, className, ...props }: TextAreaFieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <textarea id={inputId} aria-invalid={error ? true : undefined} aria-describedby={describedBy(inputId, hint, error)} className={inputClass(error, className)} {...props} />
    </FieldShell>
  );
}
