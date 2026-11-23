import type { MemberRole, MemberStatus } from '@/types/api';
import type { Tone } from './tickets';

export const ROLE_LABEL: Record<MemberRole | 'CUSTOMER', string> = { ADMIN: 'Admin', AGENT: 'Agent', CUSTOMER: 'Customer' };
export const ROLE_TONE: Record<MemberRole | 'CUSTOMER', Tone> = { ADMIN: 'primary', AGENT: 'secondary', CUSTOMER: 'info' };
export const ROLE_HINT: Record<MemberRole, string> = {
  ADMIN: 'Manages the workspace, team, settings and audit log, and handles tickets.',
  AGENT: 'Records and handles customer tickets.',
};
export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = { ACTIVE: 'Active', DEACTIVATED: 'Deactivated' };
