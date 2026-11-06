export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  role: Role;
}

export interface StoreInfo {
  id: string;
  name: string;
}