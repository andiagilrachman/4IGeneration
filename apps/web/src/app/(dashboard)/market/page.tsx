"use client";

/**
 * Halaman Market — lihat daftar saham IDX & detail data nyata.
 * Data dari: Next.js → NestJS /api/v1/stocks → FastAPI → yfinance.
 * (Week 9-10: Stock Data)
 */

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface IdxStock {
  ticker: string;
  name: string;
  sector: string;
}

interface StockDetail {
  ticker: string;
  name?: string;
  sector?: string;
  industry?: string;
  price?: number;
  trailing_pe?: number;
  roe?: number;
  revenue_growth?: number;
  profit_margin?: number;
  week52_high?: number;
  week52_low?: number;
  history: { date: string; close: number }[];
}

export default function MarketPage() {
  const [stocks, setStocks] = useState<IdxStock[]>([]);
  const [selected, setSelected] = useState<StockDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<IdxStock[]>("/stocks", { auth: false })
      .then(setStocks)
      .catch(() => setStocks([]));
  }, []);

  async function loadDetail(ticker: string) {
    setLoadingDetail(true);
    setSelected(null);
    try {
      const data = await apiFetch<StockDetail>(`/stocks/${ticker}`, { auth: false });
      setSelected(data);
    } catch {
      setSelected(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  const filtered = stocks.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Market</h1>
        <p className="mt-1 text-text-muted">
          Data saham IDX real-time (Yahoo Finance via yfinance)
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Input
              name="search"
              placeholder="Cari ticker / nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <StatusOrb status="success" label={`${stocks.length} saham IDX`} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Daftar saham */}
          <Card className="max-h-[560px] overflow-auto !p-3">
            {filtered.length === 0 && (
              <p className="p-4 text-center text-sm text-text-muted">Memuat daftar saham...</p>
            )}
            {filtered.map((s) => (
              <button
                key={s.ticker}
                onClick={() => loadDetail(s.ticker)}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-bg-elevated"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-highlight">{s.ticker}</p>
                  <p className="text-xs text-text-muted">{s.name}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-text-muted">
                  {s.sector}
                </span>
              </button>
            ))}
          </Card>

          {/* Detail */}
          <div className="space-y-4">
            {loadingDetail && (
              <Card className="text-center text-text-muted">Mengambil data...</Card>
            )}
            {!loadingDetail && selected && (
              <>
                <NeonCard glow="purple" title={selected.ticker} subtitle={selected.name ?? ""}>
                  <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Harga</p>
                      <p className="text-xl font-bold text-success">
                        {selected.price?.toLocaleString("id-ID") ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">P/E</p>
                      <p>{selected.trailing_pe?.toFixed(1) ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">ROE</p>
                      <p>{selected.roe ? `${(selected.roe * 100).toFixed(1)}%` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Margin Laba</p>
                      <p>
                        {selected.profit_margin ? `${(selected.profit_margin * 100).toFixed(1)}%` : "-"}
                      </p>
                    </div>
                  </div>
                </NeonCard>

                <Card>
                  <p className="mb-2 text-xs text-text-muted">
                    Range 52 minggu:{" "}
                    <span className="text-text-secondary">
                      {selected.week52_low?.toLocaleString("id-ID") ?? "-"} —{" "}
                      {selected.week52_high?.toLocaleString("id-ID") ?? "-"}
                    </span>
                  </p>
                  <p className="mb-2 text-xs text-text-muted">Penutupan 5 hari terakhir:</p>
                  <div className="flex gap-2">
                    {selected.history.map((h) => (
                      <div key={h.date} className="flex-1 rounded-lg bg-bg-elevated p-2 text-center">
                        <p className="text-[10px] text-text-muted">{h.date.slice(5)}</p>
                        <p className="font-mono text-sm font-semibold">
                          {h.close.toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
            {!loadingDetail && !selected && (
              <Card className="text-center text-text-muted">
                Pilih saham di daftar untuk melihat detail
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
