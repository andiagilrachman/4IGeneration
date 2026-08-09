"use client";

/**
 * Input — komponen dasar form dengan gaya cosmic.
 */

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors",
          "placeholder:text-text-disabled focus:border-primary focus:ring-1 focus:ring-primary/40",
          error && "border-error/50 focus:border-error",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-disabled">{hint}</p>
      ) : null}
    </div>
  );
}
