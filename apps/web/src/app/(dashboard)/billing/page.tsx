"use client";

/**
 * Billing — subscription, kredit, & pembayaran Midtrans Snap (W17-18).
 * Alur bayar: pilih plan → POST /payments/create → Snap popup (atau redirect)
 * → Midtrans kirim webhook → subscription aktif + kredit masuk otomatis.
 *
 * Catatan: Snap popup butuh akses internet dari browser pengguna.
 * Di preview sandbox (iframe tanpa network) gunakan tombol "Buka Halaman Bayar".
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

interface PaymentData {
  paymentId: string;
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  amount: number;
  plan: { slug: string; name: string };
}

// client key Midtrans (public — aman diekspos)
const MIDTRANS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "SB-Mid-client-bEhCDc0GPOlRITJn";
const MIDTRANS_SNAP_JS = "https://app.sandbox.midtrans.com/snap/snap.js";

export default function BillingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Current | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState<Plan | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PaymentData | null>(null);

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

  /** Inject script Snap Midtrans sekali. */
  function loadSnap(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as unknown as { snap?: unknown }).snap) {
        resolve(true);
        return;
      }
      const s = document.createElement("script");
      s.src = MIDTRANS_SNAP_JS;
      s.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function pay(plan: Plan) {
    setBusy(true);
    setPaying(plan);
    try {
      const data = await apiFetch<PaymentData>("/payments/create", {
        method: "POST",
        body: { planSlug: plan.slug },
      });
      setPendingPayment(data);

      // coba buka Snap popup (butuh internet browser)
      const ok = await loadSnap();
      if (ok) {
        const snap = (window as unknown as {
          snap: { pay: (token: string, cb?: (r: { transaction_status: string }) => void) => void };
        }).snap;
        snap.pay(data.snapToken, (result) => {
          if (result.transaction_status === "settlement" || result.transaction_status === "capture") {
            alert("✅ Pembayaran berhasil! Subscription & kredit Anda sudah aktif.");
            setPendingPayment(null);
            load();
          } else if (result.transaction_status === "pending") {
            alert("Pembayaran menunggu konfirmasi. Cek lagi nanti.");
          } else {
            alert("Pembayaran belum selesai / dibatalkan.");
          }
        });
      } else {
        alert(
          "Gagal memuat Snap popup (mungkin preview sandbox tanpa internet). " +
            "Gunakan tombol 'Buka Halaman Bayar'.",
        );
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
      setPaying(null);
    }
  }

  async function subscribeFree() {
    setBusy(true);
    try {
      await apiFetch("/subscriptions/subscribe", { method: "POST", body: { planSlug: "free" } });
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
      <p className="py-16 text-center text-text-muted">
        Memuat...
      </p>
    );
  }

  const activeSlug = current?.subscription?.plan.slug;

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Billing &amp; Kredit</h1>
        <p className="mt-1 text-text-muted">
          Kelola langganan &amp; saldo kredit Anda — pembayaran via Midtrans
        </p>

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
                    onClick={subscribeFree}
                    disabled={busy}
                  >
                    Pilih Free
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => pay(p)} disabled={busy}>
                    {paying?.slug === p.slug ? "Memproses..." : "💳 Bayar & Aktifkan"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Panel pembayaran aktif */}
        {pendingPayment && (
          <Card variant="cosmic" className="mt-6">
            <p className="font-mono text-xs text-highlight">◉ MENUNGGU PEMBAYARAN</p>
            <p className="mt-2">
              Order <span className="font-mono">{pendingPayment.orderId}</span> · Rp{" "}
              {pendingPayment.amount.toLocaleString("id-ID")} ·{" "}
              {pendingPayment.plan.name}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Snap popup gagal dimuat? Buka halaman pembayaran Midtrans di browser:
            </p>
            <a
              href={pendingPayment.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Buka Halaman Bayar ↗
            </a>
            <p className="mt-2 text-xs text-text-disabled">
              Setelah bayar, tunggu konfirmasi (webhook Midtrans) lalu muat ulang halaman.
            </p>
          </Card>
        )}

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
    </div>
  );
}
