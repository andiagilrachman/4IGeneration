"use client";

/**
 * Dashboard — Overview (Signature Look v2.1).
 * Sidebar ada di layout (dashboard). Halaman ini: stat cards data NYATA dari API
 * (credits, api-keys, history, watchlists), usage chart 7 hari, recent activity, quick actions.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/api";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface HistoryItem {
  id: string;
  type: string;
  input: string | Record<string, unknown>;
  provider?: string | null;
  modelAlias?: string | null;
  status?: string;
  createdAt: string;
}

const QUICK = [
  { label: "Screener", href: "/screener", icon: "🔍", desc: "Saring 28 saham IDX" },
  { label: "Analisis", href: "/analysis", icon: "🧠", desc: "Analisis 1 emiten" },
  { label: "Compare", href: "/compare", icon: "⚖️", desc: "Bandingkan 2-5 saham" },
  { label: "Watchlist", href: "/watchlist", icon: "📌", desc: "Pantau portofolio" },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
}

function tickerOf(item: HistoryItem): string {
  if (typeof item.input === "string") {
    try {
      const parsed = JSON.parse(item.input);
      return parsed.ticker ?? parsed.symbol ?? parsed.tickers?.join(" vs ") ?? "—";
    } catch {
      return item.input.slice(0, 12);
    }
  }
  const o = item.input ?? {};
  return (o.ticker as string) ?? (o.symbol as string) ?? (o.tickers as string[] | undefined)?.join(" vs ") ?? "—";
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [credits, setCredits] = useState<number | null>(null);
  const [keysCount, setKeysCount] = useState<number | null>(null);
  const [watchlistCount, setWatchlistCount] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [bal, keys, hist, wl] = await Promise.all([
        apiFetch<{ balance: number }>("/credits/balance"),
        apiFetch<unknown[]>("/api-keys"),
        apiFetch<HistoryItem[]>("/analysis/history?take=10"),
        apiFetch<unknown[]>("/watchlists"),
      ]);
      setCredits(bal.balance);
      setKeysCount(keys.length);
      setHistory(hist);
      setWatchlistCount(wl.length);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && user) load();
  }, [isHydrated, user, load]);

  const chart = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const count = history.filter((h) => new Date(h.createdAt).toDateString() === key).length;
      days.push({
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        count,
      });
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return { days, max };
  }, [history]);

  if (!isHydrated) {
    return <p className="py-16 text-center text-text-muted">Memuat...</p>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const stats = [
    {
      label: "Credits",
      value: credits !== null ? credits.toLocaleString("id-ID") : "—",
      sub: "sisa kredit bulan ini",
      glow: "purple" as const,
      icon: "🪙",
    },
    {
      label: "Requests",
      value: history.length ? String(history.length) : "—",
      sub: "total analisis (10 terakhir)",
      glow: "blue" as const,
      icon: "📨",
    },
    {
      label: "Active API Keys",
      value: keysCount !== null ? String(keysCount) : "—",
      sub: "kunci X-API-Key aktif",
      glow: "cyan" as const,
      icon: "🔑",
    },
    {
      label: "Watchlist",
      value: watchlistCount !== null ? String(watchlistCount) : "—",
      sub: "daftar pantauan",
      glow: "purple" as const,
      icon: "📌",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-text-muted">
            Selamat datang, <span className="text-highlight">{user.name ?? user.email}</span> 👋
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-bg-elevated/60 px-4 py-1.5 font-mono text-xs text-text-muted">
          <StatusOrb status="success" /> API Online · This Month
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <NeonCard key={s.label} glow={s.glow} title={s.label}>
            <div className="flex items-end justify-between">
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <span className="text-xl opacity-80">{s.icon}</span>
            </div>
            <p className="mt-1 text-xs text-text-muted">{s.sub}</p>
          </NeonCard>
        ))}
      </div>

      {/* Usage Overview + Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Chart */}
        <div className="glass-panel p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Usage Overview</h2>
            <span className="font-mono text-xs text-text-muted">7 hari terakhir</span>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {chart.days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary shadow-glow-purple transition-all"
                    style={{
                      height: `${Math.max(6, (d.count / chart.max) * 100)}%`,
                      opacity: d.count === 0 ? 0.25 : 1,
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-text-muted">{d.label}</span>
              </div>
            ))}
          </div>
          {chart.days.every((d) => d.count === 0) && (
            <p className="mt-3 text-center text-xs text-text-muted">
              Belum ada aktivitas minggu ini — coba{" "}
              <Link href="/screener" className="text-primary hover:underline">
                Screener
              </Link>{" "}
              atau{" "}
              <Link href="/analysis" className="text-primary hover:underline">
                Analisis
              </Link>
            </p>
          )}
        </div>

        {/* Recent activity */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
            <Link href="/analysis" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <p className="mt-6 text-sm text-text-muted">Memuat…</p>
          ) : history.length === 0 ? (
            <div className="mt-6 text-center">
              <p className="text-2xl">🛰</p>
              <p className="mt-2 text-sm text-text-muted">Belum ada aktivitas analisis.</p>
              <Link
                href="/screener"
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow-purple hover:bg-primary-hover"
              >
                Mulai Screening
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/5">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-text-primary">
                      {tickerOf(h)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {h.type} · {relativeTime(h.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-bg-elevated px-2 py-0.5 font-mono text-[10px] text-text-muted">
                      {h.modelAlias ?? "4IG"}
                    </span>
                    <StatusOrb status={(h.status ?? "success") === "success" ? "success" : "warning"} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q) => (
          <Link key={q.href} href={q.href} className="group">
            <div className="glass-panel flex items-center gap-4 p-4 transition-all group-hover:border-primary/40 group-hover:shadow-glow-purple">
              <span className="text-2xl">{q.icon}</span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold">{q.label}</p>
                <p className="truncate text-xs text-text-muted">{q.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
