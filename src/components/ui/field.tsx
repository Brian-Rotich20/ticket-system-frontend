
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function Field({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: FieldProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={inputId}
        className={cx(
          "mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none",
          error ? "ring-red-400" : "ring-slate-300",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />

      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <div id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
