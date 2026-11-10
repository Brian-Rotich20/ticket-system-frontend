
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
}
