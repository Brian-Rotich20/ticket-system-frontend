'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { ErrorState, LoadingRows } from '@/components/shared/states';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { Field } from '@/components/ui/field';
import { useOrganization } from '@/context/organization-context';
import { getCurrentOrganization, updateOrganization } from '@/features/organizations/api';
import { BusinessBrand } from '@/features/tracking/components/business-brand';
import { useQuery } from '@/hooks/use-query';
import { errorMessage } from '@/lib/api/client';
import { formatDay } from '@/lib/utils';
import type { Organization } from '@/types/api';

export const portalPath = (organizationId: string) => `/support/${organizationId}`;

function ProfileForm({ organization, onSaved }: { organization: Organization; onSaved: (o: Organization) => void }) {
  const [name, setName] = useState(organization.name);
  const [logo, setLogo] = useState(organization.logo ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const logoValue = logo.trim();
  const logoInvalid = logoValue !== '' && !/^https:\/\/\S+$/.test(logoValue);
  const dirty = name.trim() !== organization.name || (logoValue || null) !== organization.logo;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (logoInvalid || !dirty) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const patch: { name?: string; logo?: string | null } = {};
      if (name.trim() !== organization.name) patch.name = name.trim();
      if ((logoValue || null) !== organization.logo) patch.logo = logoValue || null;
      onSaved(await updateOrganization(patch));
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Business profile" description="Shown to customers on your support portal and tracking pages." />
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <Alert>{error}</Alert> : null}
        {saved ? <Alert kind="success">Saved.</Alert> : null}
        <Field label="Business name" name="name" required minLength={2} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label="Logo URL"
          name="logo"
          type="url"
          placeholder="https://…/logo.png"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          error={logoInvalid ? 'Use a public https:// image address, or leave it empty.' : undefined}
          hint="A square image works best. Upload it anywhere public (your website, a CDN) and paste the https address."
        />
        <div className="rounded-control border border-line bg-canvas p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Preview</p>
          <BusinessBrand name={name.trim() || organization.name} logo={logoInvalid ? null : logoValue || null} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={busy} disabled={!dirty || logoInvalid}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function SettingsView() {
  const { refresh } = useOrganization();
  const org = useQuery((signal) => getCurrentOrganization(signal), []);
  const [origin] = useState(() => (typeof window === 'undefined' ? '' : window.location.origin));
  const o = org.data;
  const portal = o ? `${origin}${portalPath(o.id)}` : '';

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Your business profile and customer-facing support portal." />
      {org.error ? <ErrorState error={org.error} onRetry={org.refetch} /> : null}
      {!o && org.loading ? <LoadingRows rows={3} className="h-24" /> : null}
      {o ? (
        <>
          <ProfileForm
            key={`${o.name}|${o.logo}`}
            organization={o}
            onSaved={(updated) => {
              org.setData(() => updated);
              refresh(); // the sidebar shows the name too
            }}
          />
          <Card>
            <CardHeader title="Support portal" description="Your branded page where customers can open their tracking link." />
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded-control bg-canvas px-3 py-2 text-sm">{portal}</code>
              <CopyButton value={portal} label="Copy" />
              <Link href={portalPath(o.id)} target="_blank" className="text-sm font-medium text-primary hover:underline">
                Open
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">
              A custom domain such as support.yourbusiness.co.ke can point to this portal. Ask the platform team to connect yours.
            </p>
          </Card>
          <Card>
            <CardHeader title="Organization" />
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Organization ID</dt>
                <dd className="font-mono">{o.id}</dd>
              </div>
              <div>
                <dt className="text-muted">Created</dt>
                <dd className="font-medium">{formatDay(o.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Your role</dt>
                <dd className="font-medium">{o.role === 'ADMIN' ? 'Admin' : 'Agent'}</dd>
              </div>
            </dl>
          </Card>
        </>
      ) : null}
    </div>
  );
}
