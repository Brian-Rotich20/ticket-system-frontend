
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

type AlertProps = {
  kind?: "error" | "info";
  children: ReactNode;
};

export function Alert({ kind = "error", children }: AlertProps) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg px-3 py-2 text-sm",
        kind === "error"
          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
          : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
      )}
    >
      {children}
    </div>
  );
}
