import { api } from "@/lib/api";
import type { Page, Role } from "@/lib/types";

export type TeamMember = {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export const TEAM_PAGE_SIZE = 20;

export const ROLE_TABS: { value: Role; label: string }[] = [
  { value: "AGENT", label: "Agents" },
  { value: "ADMIN", label: "Admins" },
  { value: "CUSTOMER", label: "Customers" },
];

export const ROLE_LABEL: Record<Role, string> = {
  AGENT: "Agent",
  ADMIN: "Admin",
  CUSTOMER: "Customer",
};

export const listMembers = (role: Role, page: number, signal?: AbortSignal) =>
  api<Page<TeamMember>>(`/api/v1/users?role=${role}&page=${page}&pageSize=${TEAM_PAGE_SIZE}`, { signal });

export type NewMemberInput = {
  name: string;
  email: string;
  password: string;
  role: "AGENT" | "ADMIN";
};

export const createMember = (input: NewMemberInput) => api<TeamMember>("/api/v1/users", { method: "POST", json: input });

/** Random temporary password without look-alike characters (0/O, 1/l/I). */
export function generatePassword(length = 14): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => alphabet.charAt(n % alphabet.length)).join("");
}