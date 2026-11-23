import type { Metadata } from 'next';
import { RequireRole } from '@/components/layout/require-auth';
import { SettingsView } from '@/features/settings/settings-view';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <SettingsView />
    </RequireRole>
  );
}
