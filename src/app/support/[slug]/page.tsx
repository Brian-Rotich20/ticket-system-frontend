import type { Metadata } from 'next';
import { PortalView } from '@/features/portal/portal-view';

export const metadata: Metadata = { title: 'Customer support' };

/** A business's support portal. Custom domains are mapped here by src/proxy.ts. */
export default async function SupportPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PortalView slug={slug.toLowerCase()} />;
}
