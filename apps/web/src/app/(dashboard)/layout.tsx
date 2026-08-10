"use client";

/**
 * Dashboard Layout — Signature Look v2.1.
 * Sidebar shell bersama untuk semua halaman di /(dashboard): Overview, Analisis,
 * Screener, Market, Watchlist, Compare, RAG, Recap, API Keys, Billing, Docs.
 */

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { StatusOrb } from "@/components/cosmic/status-orb";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: "🧭" },
  { label: "Analisis", href: "/analysis", icon: "🧠" },
  { label: "Screener", href: "/screener", icon: "🔍" },
  { label: "Market", href: "/market", icon: "📈" },
  { label: "Watchlist", href: "/watchlist", icon: "📌" },
  { label: "Compare", href: "/compare", icon: "⚖️" },
  { label: "RAG Q&A", href: "/rag", icon: "💬" },
  { label: "Market Recap", href: "/market-recap", icon: "📰" },
  { label: "API Keys", href: "/api-keys", icon: "🔑" },
  { label: "Billing", href: "/billing", icon: "💳" },
  { label: "Docs", href: "/docs", icon: "📖" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      {/* ===== SIDEBAR (desktop) ===== */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 bg-bg-deep/60 px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 font-display text-xs font-black text-primary shadow-glow-purple">
            4IG
          </span>
          <span className="font-display text-base font-bold">
            4IG<span className="neon-purple">eneration</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 font-semibold text-primary shadow-glow-purple"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <span>{n.icon}</span> {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-xl border border-white/5 bg-bg-elevated/60 p-3">
          <p className="truncate font-mono text-xs text-text-muted">{user?.email ?? "…"}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <StatusOrb status={user?.status === "ACTIVE" ? "success" : "warning"} />
              {user?.role ?? "…"}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-error/50 hover:text-error"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <div className="flex items-center justify-between border-b border-white/5 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 font-display text-[10px] font-black text-primary">
              4IG
            </span>
            <span className="font-display text-sm font-bold">
              4IG<span className="neon-purple">eneration</span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-text-secondary hover:border-error/50 hover:text-error"
          >
            Keluar
          </button>
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
