"use client";

/**
 * Dashboard — Command Center (Tier 2: balanced cosmic).
 * Menampilkan user asli dari store + komponen design system.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
        Memuat...
      </main>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const stats = [
    { label: "Analisis Hari Ini", value: "—", glow: "purple" as const },
    { label: "Watchlist", value: "—", glow: "blue" as const },
    { label: "Saham Dipantau", value: "—", glow: "cyan" as const },
    { label: "Kredit Tersisa", value: "—", glow: "purple" as const },
  ];

  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Command Center</h1>
            <p className="mt-1 text-text-muted">
              Selamat datang, <span className="text-highlight">{user.name ?? user.email}</span> 👋
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/api-keys">
              <Button variant="outline">🔑 API Keys</Button>
            </Link>
            <Link href="/rag">
              <Button variant="outline">💬 Q&amp;A</Button>
            </Link>
            <Link href="/market-recap">
              <Button variant="outline">📰 Recap</Button>
            </Link>
            <Link href="/analysis">
              <Button variant="outline">🧠 Analisis</Button>
            </Link>
            <Link href="/screener">
              <Button variant="outline">🔍 Screener</Button>
            </Link>
            <Link href="/market">
              <Button variant="outline">📈 Market</Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline">💳 Billing</Button>
            </Link>
            <Button variant="danger" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>

        {/* Status bar */}
        <Card variant="default" className="mt-6 flex flex-wrap items-center gap-6 !p-4">
          <StatusOrb status="success" label="API Online" />
          <StatusOrb status="info" label={`Role: ${user.role}`} />
          <StatusOrb status={user.status === "ACTIVE" ? "success" : "warning"} label={`Status: ${user.status}`} />
          <span className="ml-auto font-mono text-xs text-text-muted">{user.email}</span>
        </Card>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <NeonCard key={s.label} glow={s.glow} title={s.label}>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </NeonCard>
          ))}
        </div>

        {/* Akun + placeholder fitur */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-lg font-semibold">Akun</h2>
            <dl className="mt-3 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Role</dt>
                <dd>{user.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Status</dt>
                <dd className="text-success">● {user.status}</dd>
              </div>
            </dl>
          </Card>
          <Card className="text-center text-text-muted">
            🛰 Screener, Analisis Emiten, Playground &amp; Market — menyusul di fase berikutnya
          </Card>
        </div>
      </div>
    </main>
  );
}
