
import { cx } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      aria-hidden="true"
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
