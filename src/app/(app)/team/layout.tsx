import type { ReactNode } from "react";
import { RequireAuth } from "@/components/RequireAuth";

export default function TeamLayout({ children }: { children: ReactNode }) {
  return <RequireAuth roles={["ADMIN"]}>{children}</RequireAuth>;
}