"use client";

/**
 * Card — komponen dasar wadah dengan varian:
 * default (elevated), glass (blur hologram), cosmic (glow border).
 */

import { cn } from "@/lib/utils";

type Variant = "default" | "glass" | "cosmic";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-bg-elevated border border-white/5",
  glass: "glass-panel", // bg-glass + blur (lihat globals.css)
  cosmic: "bg-bg-elevated border border-primary/30 shadow-glow-purple",
};

export function Card({ variant = "glass", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl p-6", variantClasses[variant], className)}
      {...props}
    />
  );
}
