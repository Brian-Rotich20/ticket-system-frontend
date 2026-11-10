import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      aria-hidden
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export function Button({ variant = 'primary', loading, disabled, className, children, ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-indigo-600',
    ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:outline-indigo-600',
  }[variant];
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        styles,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string };

export function Field({ label, hint, error, id, className, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={cx(
          'mt-1 block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none',
          error ? 'ring-red-400' : 'ring-slate-300',
          className,
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'info'; children: ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cx(
        'rounded-lg px-3 py-2 text-sm',
        kind === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
      )}
    >
      {children}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200', className)}>{children}</div>;
}