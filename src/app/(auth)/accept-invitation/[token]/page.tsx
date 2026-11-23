import type { Metadata } from 'next';
import { AcceptInvitation } from '@/features/team/components/accept-invitation';

export const metadata: Metadata = { title: 'Join your team', referrer: 'no-referrer', robots: { index: false, follow: false } };

export default async function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <AcceptInvitation token={token} />;
}
