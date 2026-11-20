import { Pill } from "@/components/ui/pill";
import { ROLE_LABEL } from "@/lib/team";
import type { Role } from "@/lib/types";

const STYLE: Record<Role, string> = {
  CUSTOMER: "bg-sky-100 text-sky-700",
  AGENT: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-violet-100 text-violet-700",
};

type RoleBadgeProps = {
  role: Role;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return <Pill className={STYLE[role]}>{ROLE_LABEL[role]}</Pill>;
}