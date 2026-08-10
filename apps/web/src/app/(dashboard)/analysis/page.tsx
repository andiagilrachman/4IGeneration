"use client";

/**
 * Analisis Emiten (W13-14) — analisis 1 saham IDX berbasis data nyata + AI,
 * riwayat tersimpan otomatis per user (login wajib).
 *
 * Alur: Next.js → POST /analysis/stock (auth) → FastAPI (data + AI gateway)
 *     → hasil disimpan di tabel analysis_requests → riwayat via GET /analysis/history
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIResponseCard } from "@/components/cosmic/ai-response-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface AnalysisResult {
  id: string | null;
  provider: string;
  model: string;
  model_alias: string;
  content: string;
  stock_data?: string | null;
  response_time_ms: number;
}

interface HistoryItem {
  id: string;
  type: string;
  input: { ticker?: string } | null;
  provider: string | null;
  modelAlias: string | null;
  status: string;
  createdAt: string;
}

const SUGGESTIONS = ["BBCA", "BBRI", "TLKM", "ASII", "ADRO"];

export default function AnalysisPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [detail, setDetail] = useState<AnalysisResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await apiFetch<HistoryItem[]>("/analysis/history"));
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

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setError(null);
    setLoading(true);
    setResult(null);
    setProgress(0);
    // animasi progress simulasi (response AI ~5-15 detik)
    const timer = setInterval(() => {
      setProgress((p) => Math.min(92, p + Math.random() * 14));
    }, 700);
    try {
      const data = await apiFetch<AnalysisResult>("/analysis/stock", {
        method: "POST",
        body: { ticker: ticker.trim().toUpperCase() },
      });
      setResult(data);
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analisis gagal. Coba lagi.");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    setLoadingDetail(true);
    setDetail(null);
    try {
      setDetail(await apiFetch<AnalysisResult>(`/analysis/${id}`));
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function remove(id: string) {
    try {
      await apiFetch(`/analysis/${id}`, { method: "DELETE" });
      if (detail?.id === id) setDetail(null);
      loadHistory();
    } catch {
      // abaikan
    }
  }

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        Memuat...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Analisis Emiten</h1>
        <p className="mt-1 text-text-muted">
          Analisis fundamental &amp; teknikal satu saham IDX — data nyata + AI, riwayat tersimpan
        </p>

        {/* Input */}
        <Card className="mt-6">
          <form onSubmit={analyze} className="flex flex-wrap items-end gap-3">
            <div className="w-52">
              <Input
                name="ticker"
                label="Kode Saham"
                placeholder="mis. BBCA"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Menganalisis..." : "🧠 Analisis"}
            </Button>
            <div className="flex gap-2 pb-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTicker(s)}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-text-muted transition-colors hover:border-primary/40 hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>
        </Card>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            ⚠ {error}
          </div>
        )}

        {/* Loading / Hasil */}
        <div className="mt-6 max-w-3xl">
          {loading && (
            <AIResponseCard state="loading" modelAlias="4IG-Small" progress={progress} />
          )}
          {!loading && result && (
            <AIResponseCard
              state="completed"
              modelAlias={result.model_alias}
              provider={result.provider}
              tokensUsed={Math.round((result.content?.length ?? 0) / 4)}
              responseTimeMs={result.response_time_ms}
              content={result.content}
            />
          )}
        </div>

        {/* Data yang dipakai AI */}
        {!loading && result?.stock_data && (
          <Card className="mt-4">
            <p className="mb-2 font-mono text-xs text-highlight">◉ DATA SAHAM YANG DIPAKAI AI</p>
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-muted">
              {result.stock_data}
            </pre>
          </Card>
        )}

        {/* Riwayat + Detail */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Riwayat */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">Riwayat Analisis</h2>
              <StatusOrb status="info" label={`${history.length} item`} />
            </div>
            {history.length === 0 && (
              <Card className="text-center text-sm text-text-muted">
                Belum ada analisis — coba analisis saham pertama Anda di atas
              </Card>
            )}
            <div className="space-y-2">
              {history.map((h) => (
                <Card key={h.id} className="flex items-center justify-between !p-4">
                  <button onClick={() => openDetail(h.id)} className="text-left">
                    <p className="font-mono text-sm font-bold text-highlight">
                      {(h.input as { ticker?: string })?.ticker ?? "—"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {h.createdAt.slice(0, 16).replace("T", " ")} · {h.modelAlias ?? h.provider}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDetail(h.id)}>
                      Lihat
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => remove(h.id)}>
                      Hapus
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">Detail</h2>
            {loadingDetail && <Card className="text-center text-text-muted">Memuat...</Card>}
            {!loadingDetail && detail && (
              <AIResponseCard
                state="completed"
                modelAlias={detail.model_alias}
                provider={detail.provider}
                content={detail.content}
              />
            )}
            {!loadingDetail && !detail && (
              <Card className="text-center text-sm text-text-muted">
                Klik salah satu riwayat untuk melihat detail analisis
              </Card>
            )}
          </div>
        </div>

        <p className="mt-10 text-xs text-text-disabled">
          ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi. Keputusan investasi
          sepenuhnya tanggung jawab pengguna.
        </p>
      </div>
    </main>
  );
}
