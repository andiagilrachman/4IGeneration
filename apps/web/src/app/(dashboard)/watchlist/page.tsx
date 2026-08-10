"use client";

/**
 * Watchlist (W33-34) — pantau saham favorit per user.
 * Buat watchlist, tambah/hapus ticker, lihat data tiap saham.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Watchlist {
  id: string;
  name: string;
  tickers: string[];
  createdAt: string;
}

export default function WatchlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [lists, setLists] = useState<Watchlist[]>([]);
  const [name, setName] = useState("");
  const [newTicker, setNewTicker] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Watchlist[]>("/watchlists");
      setLists(data);
      if (data.length > 0 && !activeId) setActiveId(data[0].id);
    } catch {
      setLists([]);
    }
  }, [activeId]);

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
      const wl = await apiFetch<Watchlist>("/watchlists", {
        method: "POST",
        body: { name: name.trim() },
      });
      setName("");
      setActiveId(wl.id);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function addTicker(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !newTicker.trim()) return;
    try {
      await apiFetch(`/watchlists/${activeId}/tickers`, {
        method: "POST",
        body: { ticker: newTicker.trim().toUpperCase() },
      });
      setNewTicker("");
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function removeTicker(id: string, ticker: string) {
    await apiFetch(`/watchlists/${id}/tickers/${ticker}`, { method: "DELETE" });
    load();
  }

  async function removeList(id: string) {
    await apiFetch(`/watchlists/${id}`, { method: "DELETE" });
    setActiveId(null);
    load();
  }

  if (!isHydrated || !user) {
    return (
      <p className="py-16 text-center text-text-muted">
        Memuat...
      </p>
    );
  }

  const active = lists.find((l) => l.id === activeId);

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Watchlist</h1>
        <p className="mt-1 text-text-muted">Pantau saham favorit Anda</p>

        {/* Buat watchlist */}
        <Card className="mt-6">
          <form onSubmit={create} className="flex flex-wrap items-end gap-3">
            <div className="w-72">
              <Input
                name="wlname"
                label="Nama Watchlist"
                placeholder="mis. Bank Stocks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">+ Buat</Button>
          </form>
        </Card>

        {/* Pilih watchlist */}
        {lists.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {lists.map((l) => (
              <span
                key={l.id}
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm " +
                  (activeId === l.id
                    ? "border-primary/50 bg-primary/10 text-highlight"
                    : "border-white/10 text-text-muted")
                }
              >
                <button onClick={() => setActiveId(l.id)}>
                  📌 {l.name} ({l.tickers.length})
                </button>
                <button onClick={() => removeList(l.id)} className="text-error">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Ticker dalam watchlist aktif */}
        {active && (
          <Card className="mt-6">
            <p className="font-display text-lg font-semibold">{active.name}</p>
            <form onSubmit={addTicker} className="mt-3 flex flex-wrap items-end gap-3">
              <div className="w-44">
                <Input
                  name="ticker"
                  label="Tambah saham"
                  placeholder="BBCA"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <Button type="submit" variant="outline">
                + Tambah
              </Button>
            </form>

            {active.tickers.length === 0 && (
              <p className="mt-4 text-sm text-text-muted">Belum ada saham — tambahkan ticker</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {active.tickers.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-sm"
                >
                  <a href={`/market`} className="font-bold text-highlight hover:underline">
                    {t}
                  </a>
                  <button onClick={() => removeTicker(active.id, t)} className="text-text-muted hover:text-error">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </Card>
        )}

        <p className="mt-10 text-xs text-text-disabled">
          💡 Tips: tambahkan saham ke watchlist lalu gunakan fitur Compare untuk membandingkannya.
        </p>
      </div>
    </div>
  );
}
