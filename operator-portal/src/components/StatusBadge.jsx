import React from "react";

const STATUS_CONFIG = {
  PAID: {
    label: "PAID",
    dotClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  PARTIAL: {
    label: "PARTIAL",
    dotClass: "bg-amber-600",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  },
  DUE: {
    label: "DUE",
    dotClass: "bg-rose-600",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
  },
  INACTIVE: {
    label: "INACTIVE",
    dotClass: "bg-zinc-500",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700",
  },
};

export default function StatusBadge({ status, size = "md", className = "" }) {
  const normalized = String(status || "DUE").toUpperCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.DUE;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px] gap-1",
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  }[size] || "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      role="status"
      className={`inline-flex items-center font-semibold tracking-wide rounded-md border shadow-2xs select-none whitespace-nowrap ${config.badgeClass} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}

