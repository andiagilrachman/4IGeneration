"use client";

/**
 * NeonCard — kartu dengan aksen neon glow (BAGIAN 5: custom cosmic component).
 * glow: purple | blue | cyan
 */

import { cn } from "@/lib/utils";

type Glow = "purple" | "blue" | "cyan";

const glowClasses: Record<Glow, string> = {
  purple: "border-primary/40 shadow-glow-purple",
  blue: "border-secondary/40 shadow-glow-blue",
  cyan: "border-accent/40 shadow-glow-cyan",
};

const accentBar: Record<Glow, string> = {
  purple: "bg-primary",
  blue: "bg-secondary",
  cyan: "bg-accent",
};

interface NeonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: Glow;
  title?: string;
  subtitle?: string;
}

export function NeonCard({ glow = "purple", title, subtitle, className, children, ...props }: NeonCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-bg-elevated/80 p-6 transition-all duration-300 hover:-translate-y-0.5",
        glowClasses[glow],
        className,
      )}
      {...props}
    >
      {/* aksen garis atas */}
      <span className={cn("absolute inset-x-0 top-0 h-0.5", accentBar[glow])} />
      {title && <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>}
      {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
