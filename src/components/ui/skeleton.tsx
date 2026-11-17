import { cx } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cx("animate-pulse rounded-lg bg-slate-200", className)} aria-hidden />;
}