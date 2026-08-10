"use client";

/**
 * Screener MVP — fitur pertama 4IGeneration (milestone Phase 1) 🏁
 * Filter fundamental data saham IDX nyata + opsional analisis AI.
 * Data: Next.js → NestJS /api/v1/analysis/screener → FastAPI → yfinance (+ AI gateway)
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface Match {
  ticker: string;
  name: string;
  sector: string;
  price: number | null;
  trailing_pe: number | null;
  roe: number | null;
  revenue_growth: number | null;
  profit_margin: number | null;
}

interface ScreenResponse {
  source: "live" | "demo";
  scanned: number;
  total_matches: number;
  matches: Match[];
  ai_summary?: string | null;
}

export default function ScreenerPage() {
  const [sectors, setSectors] = useState<string[]>([]);
  const [result, setResult] = useState<ScreenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [sector, setSector] = useState("");
  const [maxPe, setMaxPe] = useState("");
  const [minRoe, setMinRoe] = useState("15");
  const [limit, setLimit] = useState("10");
  const [analyze, setAnalyze] = useState(true);

  useEffect(() => {
    apiFetch<string[]>("/stocks/sectors", { auth: false })
      .then(setSectors)
      .catch(() => setSectors([]));
  }, []);

  async function runScreener(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await apiFetch<ScreenResponse>("/analysis/screener", {
        method: "POST",
        body: {
          sector: sector || undefined,
          max_pe: maxPe ? Number(maxPe) : undefined,
          min_roe: minRoe ? Number(minRoe) / 100 : undefined, // % → desimal
          limit: Number(limit) || 10,
          analyze,
        },
        auth: false,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menjalankan screener");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Stock Screener</h1>
        <p className="mt-1 text-text-muted">
          Filter saham IDX berdasarkan fundamental — data real-time + analisis AI
        </p>

        {/* Form */}
        <Card className="mt-6">
          <form onSubmit={runScreener} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Sektor</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-bg-base px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Semua</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Input
              name="max_pe"
              label="Max P/E"
              type="number"
              placeholder="mis. 15"
              value={maxPe}
              onChange={(e) => setMaxPe(e.target.value)}
            />
            <Input
              name="min_roe"
              label="Min ROE (%)"
              type="number"
              placeholder="mis. 15"
              value={minRoe}
              onChange={(e) => setMinRoe(e.target.value)}
            />
            <Input
              name="limit"
              label="Maks hasil"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={analyze}
                  onChange={(e) => setAnalyze(e.target.checked)}
                  className="h-4 w-4 accent-[#7C3AED]"
                />
                Analisis AI
              </label>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Memindai..." : "🚀 Jalankan"}
              </Button>
            </div>
          </form>
        </Card>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            ⚠ {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-3">
            <StatusOrb status="info" label="Mengambil data 28 saham IDX..." pulse />
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-4">
            {/* Ringkasan */}
            <div className="flex flex-wrap items-center gap-3">
              <StatusOrb
                status={result.source === "live" ? "success" : "warning"}
                label={
                  result.source === "live"
                    ? "Data LIVE (Yahoo Finance)"
                    : "Data DEMO (Yahoo rate-limited)"
                }
              />
              <span className="font-mono text-xs text-text-muted">
                {result.scanned} di-scan · {result.total_matches} lolos filter
              </span>
            </div>

            {result.source === "demo" && (
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
                ⚠️ Yahoo Finance sedang rate-limited di lingkungan ini — hasil memakai data demo
                (struktur & alur sama persis dengan data live).
              </div>
            )}

            {/* AI summary */}
            {result.ai_summary && (
              <Card variant="cosmic">
                <p className="mb-2 font-mono text-xs text-highlight">◉ 4IG-SMALL · AI SUMMARY</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {result.ai_summary}
                </p>
              </Card>
            )}

            {/* Tabel hasil */}
            <Card className="overflow-x-auto !p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-xs text-text-muted">
                    <th className="px-4 py-3">Ticker</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Sektor</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                    <th className="px-4 py-3 text-right">P/E</th>
                    <th className="px-4 py-3 text-right">ROE</th>
                    <th className="px-4 py-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matches.map((m, i) => (
                    <tr key={m.ticker} className="border-b border-white/5 transition-colors hover:bg-bg-elevated">
                      <td className="px-4 py-3 font-mono font-bold text-highlight">
                        {String(i + 1).padStart(2, "0")} · {m.ticker}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{m.name}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">{m.sector}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {m.price ? m.price.toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {m.trailing_pe ? m.trailing_pe.toFixed(1) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-success">
                        {m.roe ? `${(m.roe * 100).toFixed(1)}%` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {m.profit_margin ? `${(m.profit_margin * 100).toFixed(1)}%` : "-"}
                      </td>
                    </tr>
                  ))}
                  {result.matches.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                        Tidak ada saham yang lolos filter. Coba longgarkan kriterianya.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            <p className="text-xs text-text-disabled">
              ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi. Keputusan
              investasi sepenuhnya tanggung jawab pengguna.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
