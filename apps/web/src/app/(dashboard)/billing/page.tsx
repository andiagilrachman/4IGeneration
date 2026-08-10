"use client";

/**
 * Billing — subscription & kredit user (W15-16).
 * Melihat plan aktif, saldo kredit, riwayat transaksi, subscribe/upgrade/cancel.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface Plan {
  slug: string;
  name: string;
  description: string;
  priceMonthly: number;
  creditsPerMonth: number;
}

interface Current {
  subscription: {
    plan: Plan;
    status: string;
    endsAt: string | null;
  } | null;
  credits: number;
}

interface Txn {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function BillingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [p, c, t] = await Promise.all([
      apiFetch<Plan[]>("/plans", { auth: false }).catch(() => []),
      apiFetch<Current>("/subscriptions/current").catch(() => null),
      apiFetch<Txn[]>("/credits/transactions").catch(() => []),
    ]);
    setPlans(p);
    setCurrent(c);
    setTxns(t);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    } else if (isHydrated && user) {
      load();
    }
  }, [isHydrated, user, router, load]);

  async function subscribe(slug: string) {
    setBusy(true);
    try {
      await apiFetch("/subscriptions/subscribe", { method: "POST", body: { planSlug: slug } });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    try {
      await apiFetch("/subscriptions/cancel", { method: "POST" });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        Memuat...
      </main>
    );
  }

  const activeSlug = current?.subscription?.plan.slug;

  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Billing &amp; Kredit</h1>
        <p className="mt-1 text-text-muted">Kelola langganan &amp; saldo kredit Anda</p>

        {/* Status kartu */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card variant="cosmic">
            <p className="text-sm text-text-muted">Plan Aktif</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {current?.subscription?.plan.name ?? "Belum berlangganan"}
            </p>
            <div className="mt-2">
              {current?.subscription ? (
                <StatusOrb
                  status={current.subscription.status === "ACTIVE" ? "success" : "warning"}
                  label={current.subscription.status}
                />
              ) : (
                <StatusOrb status="neutral" label="Free tier" />
              )}
            </div>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Saldo Kredit</p>
            <p className="mt-1 font-display text-4xl font-extrabold text-highlight">
              {current?.credits ?? 0}
            </p>
            <p className="mt-1 text-xs text-text-muted">1 kredit = 1 analisis saham AI</p>
          </Card>
        </div>

        {/* Pilih plan */}
        <h2 className="mt-10 font-display text-xl font-semibold">Pilih / Upgrade Plan</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.slug} className="flex flex-col">
              <p className="font-display text-lg font-bold">{p.name}</p>
              <p className="text-xs text-text-muted">{p.description}</p>
              <p className="mt-3 font-display text-2xl font-extrabold">
                Rp {Number(p.priceMonthly).toLocaleString("id-ID")}
                <span className="text-xs font-normal text-text-muted">/bln</span>
              </p>
              <p className="text-xs text-text-muted">{p.creditsPerMonth} kredit/bulan</p>
              <div className="mt-auto pt-4">
                {activeSlug === p.slug ? (
                  <Button variant="outline" disabled className="w-full">
                    ✓ Plan Aktif
                  </Button>
                ) : p.slug === "free" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => subscribe("free")}
                    disabled={busy}
                  >
                    Pilih Free
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => subscribe(p.slug)} disabled={busy}>
                    {activeSlug ? "Upgrade ke " + p.name : "Pilih " + p.name}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {current?.subscription && (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="danger" onClick={cancel} disabled={busy}>
              Batalkan Langganan
            </Button>
            <span className="text-xs text-text-muted">
              Berakhir:{" "}
              {current.subscription.endsAt
                ? new Date(current.subscription.endsAt).toLocaleDateString("id-ID")
                : "-"}
            </span>
          </div>
        )}

        {/* Riwayat transaksi */}
        <h2 className="mt-10 font-display text-xl font-semibold">Riwayat Transaksi Kredit</h2>
        <Card className="mt-4 !p-0">
          {txns.length === 0 && (
            <p className="p-6 text-center text-sm text-text-muted">Belum ada transaksi</p>
          )}
          <div className="divide-y divide-white/5">
            {txns.map((t) => {
              const sign = t.amount > 0 ? "+" : "";
              const cls = t.amount > 0 ? "text-success" : "text-bearish";
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="text-text-secondary">{t.description}</p>
                    <p className="font-mono text-xs text-text-disabled">
                      {t.type} · {new Date(t.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className={"font-mono font-bold " + cls}>
                    {sign}
                    {t.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </main>
  );
}
