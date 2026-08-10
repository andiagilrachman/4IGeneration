"use client";

/**
 * Halaman Lupa Password — POST /api/v1/auth/forgot-password.
 * Kirim email reset password via Resend.
 */

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">Lupa Password?</h1>
        <p className="mt-1 text-sm text-text-muted">
          Masukkan email — kami kirim tautan reset password.
        </p>

        {done ? (
          <div className="mt-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            ✅ Email reset password terkirim. Periksa kotak masuk Anda (termasuk spam), lalu
            ikuti tautan di dalamnya.
          </div>
        ) : (
          <>
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
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          Ingat password?{" "}
          <Link href="/login" className="text-highlight hover:underline">
            Masuk
          </Link>
        </p>
      </Card>
    </main>
  );
}
