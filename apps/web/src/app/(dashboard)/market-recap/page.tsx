"use client";

/**
 * Market Recap (W19-20) — ringkasan pasar harian.
 * Berita real-time (Google News) + data saham + AI summary.
 * Hasil tersimpan ke riwayat per user.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusOrb } from "@/components/cosmic/status-orb";
import { AIResponseCard } from "@/components/cosmic/ai-response-card";

interface Recap {
  date: string;
  recap: string;
  model_alias: string;
  source: string;
  news_count: number;
  news: { title: string; link: string; source: string; published: string }[];
  top_stocks: { ticker: string; price: number | null }[];
}

interface RecapItem {
  id: string;
  input: { date?: string } | null;
  modelAlias: string | null;
  createdAt: string;
}

export default function MarketRecapPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [recap, setRecap] = useState<Recap | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RecapItem[]>([]);
  const [detail, setDetail] = useState<Recap | null>(null);
  const [progress, setProgress] = useState(0);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await apiFetch<RecapItem[]>("/analysis/market-recap/history"));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    } else if (isHydrated && user) {
      loadHistory();
    }
  }, [isHydrated, user, router, loadHistory]);

  async function generate() {
    setLoading(true);
    setRecap(null);
    setProgress(0);
    const timer = setInterval(() => setProgress((p) => Math.min(90, p + Math.random() * 12)), 800);
    try {
      const data = await apiFetch<Recap>("/analysis/market-recap", { method: "POST" });
      setRecap(data);
      loadHistory();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      clearInterval(timer);
      setProgress(100);
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const data = await apiFetch<{ result: Recap }>(`/analysis/market-recap/${id}`);
      setDetail(data.result);
    } catch {
      setDetail(null);
    }
  }

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        Memuat...
      </main>
    );
  }

  const active = recap ?? detail;

  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Market Recap</h1>
            <p className="mt-1 text-text-muted">
              Ringkasan pasar harian — berita real-time + data saham + analisis AI
            </p>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Menyusun recap..." : "📰 Buat Recap Hari Ini"}
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 max-w-3xl">
            <AIResponseCard state="loading" modelAlias="4IG-Small" progress={progress} />
          </div>
        )}

        {/* Hasil */}
        {!loading && active && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusOrb
                status={active.source === "live" ? "success" : "warning"}
                label={active.source === "live" ? "Data LIVE" : "Data DEMO"}
              />
              <span className="font-mono text-xs text-text-muted">
                {active.date} · {active.news_count} berita · {active.model_alias}
              </span>
            </div>
            <Card variant="cosmic">
              <p className="mb-2 font-mono text-xs text-highlight">◉ RINGKASAN PASAR</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {active.recap}
              </div>
            </Card>

            {/* Berita */}
            <Card>
              <p className="mb-3 font-display text-lg font-semibold">📰 Berita Utama</p>
              <div className="space-y-2">
                {active.news.map((n, i) => (
                  <a
                    key={i}
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg px-3 py-2 transition-colors hover:bg-bg-elevated"
                  >
                    <p className="text-sm text-text-secondary">{n.title}</p>
                    <p className="font-mono text-xs text-text-disabled">
                      {n.published} · {n.source}
                    </p>
                  </a>
                ))}
              </div>
            </Card>

            {/* Saham menonjol */}
            <Card>
              <p className="mb-3 font-display text-lg font-semibold">📈 Saham Menonjol</p>
              <div className="flex flex-wrap gap-2">
                {active.top_stocks.map((s) => (
                  <span
                    key={s.ticker}
                    className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-sm"
                  >
                    <span className="font-bold text-highlight">{s.ticker}</span>{" "}
                    <span className="text-text-muted">
                      {s.price ? s.price.toLocaleString("id-ID") : "-"}
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}
        {!loading && !active && (
          <Card className="mt-6 text-center text-text-muted">
            Klik "Buat Recap Hari Ini" untuk ringkasan pasar terbaru
          </Card>
        )}

        {/* Riwayat */}
        <h2 className="mt-10 font-display text-xl font-semibold">Riwayat Recap</h2>
        <div className="mt-3 space-y-2">
          {history.length === 0 && (
            <Card className="text-center text-sm text-text-muted">Belum ada recap</Card>
          )}
          {history.map((h) => (
            <Card key={h.id} className="flex items-center justify-between !p-4">
              <div>
                <p className="font-mono text-sm font-bold text-highlight">
                  Recap {h.input?.date ?? "—"}
                </p>
                <p className="text-xs text-text-muted">
                  {h.createdAt.slice(0, 16).replace("T", " ")} · {h.modelAlias}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => openDetail(h.id)}>
                Lihat
              </Button>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-xs text-text-disabled">
          ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi.
        </p>
      </div>
    </main>
  );
}
