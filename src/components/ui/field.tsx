import type { InputHTMLAttributes } from "react";
import {
  FieldShell,
  describedBy,
  inputClass,
  type FieldBaseProps,
} from "@/components/ui/form-control";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & FieldBaseProps;

export function Field({ label, hint, error, id, className, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={inputClass(error, className)}
        {...props}
      />
    </FieldShell>
  );
}