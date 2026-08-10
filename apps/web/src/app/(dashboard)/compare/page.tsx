"use client";

/**
 * Compare (W33-34) — bandingkan 2-5 saham IDX (data nyata + AI summary).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AIResponseCard } from "@/components/cosmic/ai-response-card";

interface Stock {
  ticker: string;
  name: string;
  price: number | null;
  trailing_pe: number | null;
  roe: number | null;
  revenue_growth: number | null;
  profit_margin: number | null;
}

interface CompareResult {
  stocks: Stock[];
  summary: string;
  model_alias: string;
}

export default function ComparePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [tickers, setTickers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [progress, setProgress] = useState(0);

  if (!isHydrated || !user) {
    return (
      <p className="py-16 text-center text-text-muted">
        Memuat...
      </p>
    );
  }

  function addTicker() {
    const t = input.trim().toUpperCase();
    if (t && tickers.length < 5 && !tickers.includes(t)) {
      setTickers([...tickers, t]);
      setInput("");
    }
  }

  async function compare() {
    if (tickers.length < 2) return;
    setLoading(true);
    setResult(null);
    setProgress(0);
    const timer = setInterval(() => setProgress((p) => Math.min(90, p + Math.random() * 12)), 800);
    try {
      const data = await apiFetch<CompareResult>("/analysis/compare", {
        method: "POST",
        body: { tickers },
      });
      setResult(data);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      clearInterval(timer);
      setProgress(100);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Bandingkan Saham</h1>
        <p className="mt-1 text-text-muted">Pilih 2-5 saham IDX — bandingkan data + AI summary</p>

        <Card className="mt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-44">
              <Input
                name="ticker"
                label="Kode saham"
                placeholder="BBCA"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTicker();
                  }
                }}
              />
            </div>
            <Button variant="outline" onClick={addTicker} disabled={tickers.length >= 5}>
              + Tambah
            </Button>
            <Button onClick={compare} disabled={tickers.length < 2 || loading}>
              {loading ? "Membandingkan..." : "⚖️ Bandingkan"}
            </Button>
          </div>

          {tickers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tickers.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-sm"
                >
                  {t}
                  <button
                    onClick={() => setTickers(tickers.filter((x) => x !== t))}
                    className="text-text-muted hover:text-error"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-text-muted">{tickers.length}/5 saham dipilih (min 2)</p>
        </Card>

        {loading && (
          <div className="mt-6 max-w-3xl">
            <AIResponseCard state="loading" modelAlias="4IG-Small" progress={progress} />
          </div>
        )}

        {!loading && result && (
          <div className="mt-6 space-y-4">
            <Card variant="cosmic">
              <p className="mb-2 font-mono text-xs text-highlight">◉ AI SUMMARY · {result.model_alias}</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {result.summary}
              </div>
            </Card>

            {/* Tabel perbandingan */}
            <Card className="overflow-x-auto !p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-xs text-text-muted">
                    <th className="px-4 py-3">Metrik</th>
                    {result.stocks.map((s) => (
                      <th key={s.ticker} className="px-4 py-3 text-right font-mono text-highlight">
                        {s.ticker}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Harga", (s: Stock) => (s.price ? s.price.toLocaleString("id-ID") : "-")],
                    ["P/E", (s: Stock) => (s.trailing_pe ? s.trailing_pe.toFixed(1) : "-")],
                    ["ROE", (s: Stock) => (s.roe ? `${(s.roe * 100).toFixed(1)}%` : "-")],
                    ["Pertumbuhan", (s: Stock) => (s.revenue_growth ? `${(s.revenue_growth * 100).toFixed(1)}%` : "-")],
                    ["Margin", (s: Stock) => (s.profit_margin ? `${(s.profit_margin * 100).toFixed(1)}%` : "-")],
                  ].map(([label, fn]) => (
                    <tr key={label as string} className="border-b border-white/5">
                      <td className="px-4 py-3 text-text-muted">{label as string}</td>
                      {result.stocks.map((s) => (
                        <td key={s.ticker} className="px-4 py-3 text-right font-mono">
                          {(fn as (s: Stock) => string)(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        <p className="mt-10 text-xs text-text-disabled">
          ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi.
        </p>
      </div>
    </div>
  );
}
