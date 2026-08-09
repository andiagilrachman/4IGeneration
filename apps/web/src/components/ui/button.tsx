"use client";

/**
 * Button — komponen dasar dengan varian cosmic (blueprint BAGIAN 5).
 * Varian: default (primary cosmic), ghost, outline, link, danger.
 */

import { cn } from "@/lib/utils";

type Variant = "default" | "ghost" | "outline" | "link" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-primary text-white shadow-glow-purple hover:bg-primary-hover active:bg-primary-active",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
  outline:
    "border border-white/10 bg-bg-elevated text-text-secondary hover:border-primary/40 hover:text-text-primary",
  link: "bg-transparent text-highlight hover:underline p-0 shadow-none",
  danger:
    "bg-error/10 text-error border border-error/30 hover:bg-error/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
