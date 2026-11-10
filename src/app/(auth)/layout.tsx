import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 text-lg font-semibold text-slate-900">Support Desk</div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}