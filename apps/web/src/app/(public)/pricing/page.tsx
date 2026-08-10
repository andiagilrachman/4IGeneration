"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ParticleField } from "@/components/cosmic/particle-field";
import { NeonCard } from "@/components/cosmic/neon-card";
import { Button } from "@/components/ui/button";

interface Plan {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  creditsPerMonth: number;
  features: Record<string, unknown>;
}

const glowByIndex = ["cyan", "purple", "blue"] as const;

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    apiFetch<Plan[]>("/plans", { auth: false }).then(setPlans).catch(() => setPlans([]));
  }, []);

  return (
    <main className="relative min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <ParticleField density={18} />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-widest text-highlight">
            ◉ HARGA TRANSPARAN
          </span>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            Pilih Plan <span className="neon-purple">Anda</span>
          </h1>
          <p className="mt-4 text-text-secondary">
            Mulai gratis — upgrade kapan saja. Semua plan termasuk analisis AI &amp; data pasar.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <NeonCard
              key={p.slug}
              glow={glowByIndex[i] ?? "purple"}
              title={p.name}
              className="flex flex-col"
            >
              <p className="mt-1 min-h-[40px] text-sm text-text-muted">{p.description}</p>
              <p className="mt-4">
                <span className="font-display text-4xl font-extrabold">
                  Rp {Number(p.priceMonthly).toLocaleString("id-ID")}
                </span>
                <span className="text-sm text-text-muted">/bulan</span>
              </p>
              {p.priceYearly ? (
                <p className="text-xs text-text-muted">
                  atau Rp {Number(p.priceYearly).toLocaleString("id-ID")}/tahun
                </p>
              ) : (
                <p className="text-xs text-text-muted">Gratis selamanya</p>
              )}
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                <li>✅ {p.creditsPerMonth} kredit/bulan</li>
                <li>✅ Analisis AI saham IDX</li>
                <li>✅ Screener fundamental</li>
                <li>✅ Data pasar real-time</li>
                <li>💬 Support: {String(p.features?.support ?? "-")}</li>
              </ul>
              <div className="mt-auto pt-6">
                {p.slug === "free" ? (
                  <Link href="/register" className="block">
                    <Button className="w-full" variant="outline">
                      Mulai Gratis
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register" className="block">
                    <Button className="w-full">Pilih {p.name}</Button>
                  </Link>
                )}
              </div>
            </NeonCard>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-text-disabled">
          ⚖️ Disclaimer: alat analisis edukatif, bukan rekomendasi investasi. Pembayaran otomatis
          akan aktif setelah integrasi payment gateway (Midtrans).
        </p>
      </div>
    </main>
  );
}
