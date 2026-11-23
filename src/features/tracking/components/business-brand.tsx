import { Avatar } from '@/components/ui/avatar';

/** A business's logo and name on its public pages. The logo is an https URL set in the business settings. */
export function BusinessBrand({ name, logo }: { name: string; logo: string | null }) {
  return (
    <span className="inline-flex items-center gap-3">
      {logo ? (
        // a tenant-provided URL on any host: next/image would need every domain whitelisted
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-control border border-line bg-surface object-contain" />
      ) : (
        <Avatar name={name} tone="primary" />
      )}
      <span className="text-lg font-semibold text-ink">{name}</span>
    </span>
  );
}
