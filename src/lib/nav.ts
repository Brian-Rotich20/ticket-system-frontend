import type { Role } from './types';

export interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['CUSTOMER', 'AGENT', 'ADMIN'] },
  { href: '/tickets', label: 'My tickets', roles: ['CUSTOMER'] },
  { href: '/queue', label: 'Queue', roles: ['AGENT', 'ADMIN'] },
  { href: "/team", label: "Team", roles: ["ADMIN"] },
  { href: "/audit", label: "Audit log", roles: ["ADMIN"] },
];