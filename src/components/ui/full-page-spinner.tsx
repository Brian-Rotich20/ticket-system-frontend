import { Spinner } from "@/components/ui/spinner";

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-400">
      <Spinner className="h-6 w-6" />
    </div>
  );
}