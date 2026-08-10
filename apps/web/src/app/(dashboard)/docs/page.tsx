"use client";

/**
 * Developer Docs (W27-28) — dokumentasi Public API & SDK 4IGeneration.
 * Cara pakai: buat API key → X-API-Key → panggil endpoint /public/* atau pakai SDK.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-base p-4 font-mono text-xs leading-relaxed text-text-secondary">
      {code}
    </pre>
  );
}

export default function DocsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated || !user) {
    return (
      <p className="py-16 text-center text-text-muted">
        Memuat...
      </p>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Developer Docs</h1>
        <p className="mt-1 text-text-muted">
          Dokumentasi Public API &amp; SDK 4IGeneration — integrasikan analisis saham IDX ke aplikasi Anda
        </p>

        {/* Quick start */}
        <NeonCard glow="cyan" title="⚡ Quick Start" subtitle="3 langkah mulai pakai API">
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-text-secondary">
            <li>
              Buat API key di <Link href="/api-keys" className="text-highlight underline">halaman API Keys</Link>
            </li>
            <li>Salin key (format <code className="text-highlight">4IG_XXXX_YYYY</code>)</li>
            <li>Kirim di header <code className="text-highlight">X-API-Key</code> — atau pakai SDK</li>
          </ol>
        </NeonCard>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Endpoint */}
          <Card>
            <p className="font-display text-lg font-semibold">🔌 Endpoint</p>
            <div className="mt-3 space-y-2 font-mono text-xs">
              {[
                ["GET", "/public/stocks", "Daftar saham IDX"],
                ["GET", "/public/stocks/:ticker", "Detail saham (harga, ROE, PE)"],
                ["POST", "/public/analysis/screener", "Screener fundamental"],
                ["POST", "/public/analysis/stock", "Analisis AI 1 saham"],
              ].map(([m, p, d]) => (
                <div key={p} className="flex items-start gap-3 rounded-lg bg-bg-elevated px-3 py-2">
                  <span className={m === "GET" ? "font-bold text-success" : "font-bold text-accent"}>{m}</span>
                  <span className="text-text-secondary">{p}</span>
                  <span className="ml-auto text-text-muted">{d}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Base URL: <code className="text-highlight">https://api.4igeneration.com/v1</code> (dev: localhost:3001/api/v1)
            </p>
          </Card>

          {/* SDK */}
          <Card>
            <p className="font-display text-lg font-semibold">📦 SDK</p>
            <p className="mt-1 text-xs text-text-muted">JavaScript (TypeScript) &amp; Python — ada di monorepo <code>packages/</code></p>
            <CodeBlock code={`// JavaScript / TypeScript
import { FourIG } from "@4ig/sdk-js";

const client = new FourIG({ apiKey: "4IG_XXXX_YYYY" });
const bbca = await client.stocks.detail("BBCA");
console.log(bbca.price); // 6375

const hasil = await client.analysis.screener({ min_roe: 0.15 });`} />
            <CodeBlock code={`# Python
from sdk_python import FourIG

client = FourIG(api_key="4IG_XXXX_YYYY")
data = client.stocks.detail("BBCA")
print(data["price"])

client.analysis.stock("TLKM")`} />
          </Card>
        </div>

        {/* Contoh curl */}
        <Card className="mt-6">
          <p className="font-display text-lg font-semibold">🧪 Contoh curl</p>
          <CodeBlock code={`# Data saham
curl https://api.4igeneration.com/v1/public/stocks/BBCA \\
  -H "X-API-Key: 4IG_XXXX_YYYY"

# Screener fundamental (ROE >= 15%)
curl -X POST https://api.4igeneration.com/v1/public/analysis/screener \\
  -H "X-API-Key: 4IG_XXXX_YYYY" -H "Content-Type: application/json" \\
  -d '{"min_roe":0.15,"limit":10}'`} />
        </Card>

        {/* Keamanan */}
        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <StatusOrb status="info" label="Rate limit: 60 req/menit per key" />
            <StatusOrb status="success" label="Key di-hash bcrypt" />
          </div>
          <p className="mt-3 text-sm text-text-muted">
            Jangan pernah mengekspos API key di kode client-side publik. Simpan di server / environment
            variable. Cabut key yang bocor di halaman API Keys.
          </p>
        </Card>

        <p className="mt-10 text-xs text-text-disabled">
          ⚖️ Disclaimer: data &amp; analisis bersifat edukatif — bukan rekomendasi investasi.
        </p>
      </div>
    </div>
  );
}
