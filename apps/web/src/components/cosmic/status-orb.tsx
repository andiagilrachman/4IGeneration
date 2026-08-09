"use client";

/**
 * StatusOrb — indikator status dengan efek pulse (BAGIAN 5: custom cosmic component).
 * status: success | warning | error | info | neutral
 */

import { cn } from "@/lib/utils";

type Status = "success" | "warning" | "error" | "info" | "neutral";

const colorMap: Record<Status, { dot: string; ring: string; label: string }> = {
  success: { dot: "bg-success", ring: "bg-success/30", label: "text-success" },
  warning: { dot: "bg-warning", ring: "bg-warning/30", label: "text-warning" },
  error: { dot: "bg-error", ring: "bg-error/30", label: "text-error" },
  info: { dot: "bg-info", ring: "bg-info/30", label: "text-info" },
  neutral: { dot: "bg-neutral", ring: "bg-neutral/30", label: "text-neutral" },
};

interface StatusOrbProps {
  status?: Status;
  label?: string;
  pulse?: boolean;
}

export function StatusOrb({ status = "neutral", label, pulse = true }: StatusOrbProps) {
  const c = colorMap[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", c.ring)} />}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", c.dot)} />
      </span>
      {label && <span className={cn("text-xs font-medium", c.label)}>{label}</span>}
    </span>
  );
}
