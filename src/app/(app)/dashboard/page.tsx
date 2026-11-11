'use client';

import { Card } from '@/components/ui/card';
import { useUser } from '@/context/auth-context';

const HINT = {
  CUSTOMER: 'You will create and follow your support tickets here.',
  AGENT: 'You will work the ticket queue here.',
  ADMIN: 'You will manage tickets and your team here.',
} as const;

export default function DashboardPage() {
  const user = useUser();
  const firstName = user.name.trim().split(/\s+/)[0] || 'there';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hi, {firstName}</h1>
      <Card>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Store</dt>
            <dd className="font-medium">{user.tenantId}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium">{user.role}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">{HINT[user.role]}</p>
      </Card>
    </div>
  );
}