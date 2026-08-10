"use client";

/**
 * API Keys (W25-26) — kelola API key untuk akses Public API 4IGeneration.
 * Buat key → salin (hanya tampil sekali) → pakai di header X-API-Key → lihat usage → revoke.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[] | null;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ total: number; recent: unknown[] } | null>(null);

  const load = useCallback(async () => {
    try {
      setKeys(await apiFetch<ApiKeyItem[]>("/api-keys"));
    } catch {
      setKeys([]);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    } else if (isHydrated && user) {
      load();
    }
  }, [isHydrated, user, router, load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const data = await apiFetch<{ key: string; prefix: string }>("/api-keys", {
        method: "POST",
        body: { name: name.trim() },
      });
      setNewKey(data.key);
      setName("");
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function revoke(id: string) {
    try {
      await apiFetch(`/api-keys/${id}`, { method: "DELETE" });
      load();
    } catch {
      // abaikan
    }
  }

  async function showUsage(id: string) {
    try {
      setUsage(await apiFetch(`/api-keys/${id}/usage`));
    } catch {
      setUsage(null);
    }
  }

  if (!isHydrated || !user) {
    return (
      <p className="py-16 text-center text-text-muted">
        Memuat...
      </p>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold">API Keys</h1>
        <p className="mt-1 text-text-muted">
          Akses Public API 4IGeneration untuk aplikasi Anda — pakai header{" "}
          <code className="text-highlight">X-API-Key</code>
        </p>

        {/* Buat key */}
        <Card className="mt-6">
          <form onSubmit={create} className="flex flex-wrap items-end gap-3">
            <div className="w-72">
              <Input
                name="keyname"
                label="Nama Aplikasi"
                placeholder="mis. Bot Telegram Saya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">🔑 Buat API Key</Button>
          </form>

          {newKey && (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4">
              <p className="font-mono text-xs text-success">⚠️ SALIN SEKARANG — hanya tampil sekali!</p>
              <p className="mt-2 break-all font-mono text-sm text-text-primary">{newKey}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  alert("API key disalin!");
                }}
              >
                📋 Salin
              </Button>
            </div>
          )}
        </Card>

        {/* Daftar key */}
        <h2 className="mt-8 font-display text-xl font-semibold">API Keys Anda</h2>
        <div className="mt-3 space-y-2">
          {keys.length === 0 && (
            <Card className="text-center text-sm text-text-muted">
              Belum ada API key — buat satu di atas
            </Card>
          )}
          {keys.map((k) => (
            <Card key={k.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
              <div>
                <p className="font-semibold">{k.name}</p>
                <p className="font-mono text-xs text-text-muted">
                  4IG_{k.keyPrefix}_•••••••• · scopes: {k.scopes?.join(", ") ?? "-"}
                </p>
                <p className="mt-1">
                  <StatusOrb status={k.isActive ? "success" : "warning"} label={k.isActive ? "Aktif" : "Dicabut"} />
                  <span className="ml-3 text-xs text-text-disabled">
                    dibuat {new Date(k.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => showUsage(k.id)}>
                  Usage
                </Button>
                {k.isActive && (
                  <Button variant="danger" size="sm" onClick={() => revoke(k.id)}>
                    Cabut
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Usage */}
        {usage && (
          <Card className="mt-6">
            <p className="font-display text-lg font-semibold">Statistik Penggunaan</p>
            <p className="mt-1 text-sm text-text-muted">
              Total <span className="font-mono text-highlight">{usage.total}</span> request
            </p>
          </Card>
        )}

        {/* Cara pakai */}
        <Card className="mt-8">
          <p className="font-display text-lg font-semibold">Contoh Penggunaan</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-bg-base p-4 font-mono text-xs leading-relaxed text-text-secondary">
{`# Daftar saham IDX
curl https://api.4igeneration.com/v1/public/stocks \\
  -H "X-API-Key: 4IG_XXXX_YYYY..."

# Data saham BBCA
curl https://api.4igeneration.com/v1/public/stocks/BBCA \\
  -H "X-API-Key: 4IG_XXXX_YYYY..."

# Screener fundamental
curl -X POST https://api.4igeneration.com/v1/public/analysis/screener \\
  -H "X-API-Key: 4IG_XXXX_YYYY..." -H "Content-Type: application/json" \\
  -d '{"min_roe":0.15,"limit":10}'`}
          </pre>
        </Card>
      </div>
    </div>
  );
}
