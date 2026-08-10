"use client";

/**
 * Halaman Reset Password — POST /api/v1/auth/reset-password.
 * Token diambil dari query ?token= (dari email reset).
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    if (!token) {
      setError("Tautan tidak valid — pastikan membuka dari email reset password.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: { token, password },
        auth: false,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset password. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-bold">Buat Password Baru</h1>
      <p className="mt-1 text-sm text-text-muted">
        Setelah ini, gunakan password baru untuk masuk.
      </p>

      {done ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            ✅ Password berhasil diubah! Silakan masuk dengan password baru.
          </div>
          <Link href="/login">
            <Button className="w-full" size="lg">
              Ke Halaman Login
            </Button>
          </Link>
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
              name="password"
              label="Password Baru"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
            <Input
              name="confirm"
              label="Konfirmasi Password"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
            />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <Suspense fallback={<p className="text-text-muted">Memuat...</p>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
