import { cx } from "@/lib/utils";

type AvatarProps = {
  name: string;
  tone?: "indigo" | "slate";
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function Avatar({ name, tone = "slate", className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        tone === "indigo" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}