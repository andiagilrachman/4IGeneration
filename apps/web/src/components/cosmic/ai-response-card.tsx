"use client";

/**
 * AIResponseCard — pola respons AI (blueprint BAGIAN 5):
 * loading (Neural Core Active + progress), completed (tokens + actions),
 * error (provider timeout + fallback).
 *
 * state: "loading" | "completed" | "error"
 */

import { cn } from "@/lib/utils";

type State = "loading" | "completed" | "error";

interface AIResponseCardProps {
  state?: State;
  modelAlias?: string;
  provider?: string;
  progress?: number; // 0-100 untuk loading
  tokensUsed?: number;
  responseTimeMs?: number;
  content?: string;
  errorMessage?: string;
}

export function AIResponseCard({
  state = "loading",
  modelAlias = "4IG-Small",
  provider,
  progress = 0,
  tokensUsed,
  responseTimeMs,
  content,
  errorMessage,
}: AIResponseCardProps) {
  return (
    <div className="glass-panel overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <span className="font-mono text-xs text-highlight">◉ {modelAlias}</span>
        {provider && <span className="font-mono text-xs text-text-disabled">{provider}</span>}
        {state === "completed" && (
          <span className="font-mono text-xs text-success">✓ Complete</span>
        )}
        {state === "error" && <span className="font-mono text-xs text-error">✗ Failed</span>}
      </div>

      {/* body */}
      <div className="px-5 py-4">
        {state === "loading" && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-text-muted">Neural Core Active</p>
            <div className="space-y-1.5">
              {["Fetching stock data...", "Analyzing fundamentals...", "Generating insights..."].map(
                (step, i) => (
                  <p key={step} className={cn("font-mono text-sm", i <= Math.floor(progress / 40) ? "text-text-secondary" : "text-text-disabled")}>
                    ▪ {step}
                  </p>
                ),
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="font-mono text-xs text-text-muted">
              {Math.round(progress)}% · Est. {Math.max(1, Math.round(2.4 * (1 - progress / 100) * 10) / 10)}s remaining
            </p>
          </div>
        )}

        {state === "completed" && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-text-muted">
              {tokensUsed ?? 428} tokens · {responseTimeMs ?? 1.2}s response time
            </p>
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-text-secondary">
              {content ?? "Hasil analisis AI akan tampil di sini."}
            </div>
            <div className="flex gap-2 pt-1">
              {["Copy", "Regenerate", "Share", "Save"].map((a) => (
                <button
                  key={a}
                  className="rounded-md border border-white/10 px-3 py-1 text-xs text-text-muted transition-colors hover:border-primary/40 hover:text-text-primary"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <p className="font-mono text-sm text-error">⚠ {errorMessage ?? "Provider timeout, retrying..."}</p>
            <p className="font-mono text-xs text-text-muted">Trying next provider (Groq)...</p>
            <div className="flex gap-2">
              <button className="rounded-md border border-white/10 px-3 py-1 text-xs text-text-muted hover:text-text-primary">
                Cancel
              </button>
              <button className="rounded-md bg-primary px-3 py-1 text-xs text-white hover:bg-primary-hover">
                Retry Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
