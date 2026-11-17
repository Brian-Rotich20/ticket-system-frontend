import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export type FieldBaseProps = {
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function inputClass(error?: string, className?: string) {
  return cx(
    "mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none",
    error ? "ring-red-400" : "ring-slate-300",
    className
  );
}

/** Links the control to its hint/error text for screen readers. */
export function describedBy(id: string, hint?: ReactNode, error?: string) {
  return error || hint ? `${id}-msg` : undefined;
}

type FieldShellProps = FieldBaseProps & {
  id: string;
  children: ReactNode;
};

export function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-msg`} className="mt-1 text-xs text-slate-500">
          {hint}
        </div>
      ) : null}
    </div>
  );
}