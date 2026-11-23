import type { IconName } from '@/components/ui/icons';
import type { MemberRole } from '@/types/api';

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  roles: MemberRole[];
}

/** Role-aware navigation: roles are the user's role in the CURRENT organization. The backend enforces them. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/app/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'AGENT'] },
  { href: '/app/tickets', label: 'Tickets', icon: 'tickets', roles: ['ADMIN', 'AGENT'] },
  { href: '/app/contacts', label: 'Contacts', icon: 'contacts', roles: ['ADMIN', 'AGENT'] },
  { href: '/app/team', label: 'Team', icon: 'team', roles: ['ADMIN'] },
  { href: '/app/settings', label: 'Settings', icon: 'settings', roles: ['ADMIN'] },
  { href: '/app/audit-logs', label: 'Audit log', icon: 'audit', roles: ['ADMIN'] },
];

export const navFor = (role: MemberRole) => NAV_ITEMS.filter((i) => i.roles.includes(role));

export const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
