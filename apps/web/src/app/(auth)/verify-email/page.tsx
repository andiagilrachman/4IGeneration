"use client";

/**
 * Halaman Verifikasi Email — POST /api/v1/auth/verify-email.
 * Token dari email (?token=). Bisa kirim ulang verifikasi.
 */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

type State = "loading" | "success" | "error" | "idle";

function VerifyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<State>(token ? "loading" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const verify = useCallback(async (t: string) => {
    setState("loading");
    try {
      await apiFetch("/auth/verify-email", { method: "POST", body: { token: t }, auth: false });
      setState("success");
      setMessage("Email Anda berhasil diverifikasi! 🎉");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Token tidak valid.");
    }
  }, []);

  useEffect(() => {
    if (token) verify(token);
  }, [token, verify]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: { email },
        auth: false,
      });
      setMessage("Email verifikasi terkirim ulang — cek kotak masuk Anda.");
      setState("idle");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal mengirim ulang.");
      setState("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-bold">Verifikasi Email</h1>
      <p className="mt-1 text-sm text-text-muted">Aktifkan alamat email akun 4IGeneration Anda.</p>

      <div className="mt-6">
        {state === "loading" && (
          <div className="rounded-lg border border-white/10 bg-bg-elevated px-4 py-3 text-sm text-text-secondary">
            ⏳ Memverifikasi...
          </div>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              ✅ {message}
            </div>
            <Link href="/dashboard">
              <Button className="w-full" size="lg">
                Ke Dashboard
              </Button>
            </Link>
          </div>
        )}

        {(state === "error" || state === "idle") && (
          <form className="space-y-4" onSubmit={resend}>
            {message && (
              <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
                ⚠ {message}
              </div>
            )}
            <Input
              name="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
            <Button type="submit" disabled={sending} className="w-full" size="lg">
              {sending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Sudah terverifikasi?{" "}
        <Link href="/login" className="text-highlight hover:underline">
          Masuk
        </Link>
      </p>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <Suspense fallback={<p className="text-text-muted">Memuat...</p>}>
        <VerifyForm />
      </Suspense>
    </main>
  );
}
