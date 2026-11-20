import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

type PillProps = {
  className?: string;
  children: ReactNode;
};

export function Pill({ className, children }: PillProps) {
  return (
    <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}