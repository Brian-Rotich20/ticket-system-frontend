import type { ReactNode } from "react";
import { RequireAuth } from "@/components/RequireAuth";

export default function QueueLayout({ children }: { children: ReactNode }) {
  return <RequireAuth roles={["AGENT", "ADMIN"]}>{children}</RequireAuth>;
}