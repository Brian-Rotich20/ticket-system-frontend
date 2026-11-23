import type { Metadata } from 'next';
import { RequireRole } from '@/components/layout/require-auth';
import { TeamView } from '@/features/team/components/team-view';

export const metadata: Metadata = { title: 'Team' };

export default function TeamPage() {
  return (
    <RequireRole roles={['ADMIN']}>
      <TeamView />
    </RequireRole>
  );
}
