import type { Metadata } from 'next';
import { PublicTicketView } from '@/features/tracking/components/public-ticket-view';

/** The token is a secret: never send it on in a Referer header, never index the page. */
export const metadata: Metadata = {
  title: 'Track your request',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicTicketView token={token} />;
}
