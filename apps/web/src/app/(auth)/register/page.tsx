"use client";

/**
 * Halaman Register — terhubung ke POST /api/v1/auth/register.
 * Password min 8 karakter (sesuai validasi API).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal daftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <div className="glass-panel w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-sm text-text-muted">Mulai analisis saham dengan AI</p>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ⚠ {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-text-secondary">
              Nama (opsional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-text-disabled">Minimal 8 karakter</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-highlight hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
