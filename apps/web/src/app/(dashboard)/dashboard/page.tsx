"use client";

/**
 * Dashboard — Command Center (Tier 2).
 * Menampilkan user asli dari store (hasil GET /auth/me saat login).
 */

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

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
    { label: "Analisis Hari Ini", value: "—" },
    { label: "Watchlist", value: "—" },
    { label: "Saham Dipantau", value: "—" },
    { label: "Kredit Tersisa", value: "—" },
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
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-bg-elevated px-4 py-2 text-sm text-text-secondary transition-colors hover:border-error/40 hover:text-error"
          >
            Keluar
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-5">
              <p className="text-sm text-text-muted">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="glass-panel p-6">
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
          </div>
          <div className="glass-panel p-6 text-center text-text-muted">
            🛰 Screener, Analisis Emiten, Playground &amp; Market — menyusul di fase berikutnya
          </div>
        </div>
      </div>
    </main>
  );
}
