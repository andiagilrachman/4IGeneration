"use client";

/**
 * Halaman Register — terhubung ke POST /api/v1/auth/register.
 * Password min 8 karakter (sesuai validasi API).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-sm text-text-muted">Mulai analisis saham dengan AI</p>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ⚠ {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            name="name"
            label="Nama (opsional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap"
          />
          <Input
            name="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Minimal 8 karakter"
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Mendaftarkan..." : "Daftar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-highlight hover:underline">
            Masuk
          </Link>
        </p>
      </Card>
    </main>
  );
}
