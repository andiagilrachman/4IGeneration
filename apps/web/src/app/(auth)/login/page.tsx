"use client";

/**
 * Halaman Login — terhubung ke POST /api/v1/auth/login.
 * Tier 3: minimal cosmic — memakai komponen design system (Input, Button).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Masuk</h1>
        <p className="mt-1 text-sm text-text-muted">4IGeneration — AI Intelligence Platform</p>

        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
            ⚠ {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="text-highlight hover:underline">
            Daftar
          </Link>
        </p>
      </Card>
    </main>
  );
}
