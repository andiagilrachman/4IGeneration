"use client";

/**
 * RAG Q&A (W21-24) — tanya jawab dengan laporan keuangan PDF.
 * Upload PDF → ChromaDB vector store → tanya jawab dengan AI (jawaban berbasis dokumen).
 *
 * Alur: Next.js → POST /rag/upload (multipart) → FastAPI (pypdf + Gemini embedding + ChromaDB)
 *     → POST /rag/ask (retrieve chunk relevan → AI jawab dengan konteks)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, API_URL, getAccessToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusOrb } from "@/components/cosmic/status-orb";

interface Doc {
  id: string;
  filename: string;
  chunks: number;
  created_at: string;
}

interface Answer {
  answer: string;
  model_alias: string;
  sources: { filename: string; chunk_index: number; distance: number }[];
}

interface ChatMsg {
  role: "user" | "ai";
  content: string;
}

export default function RagPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [asking, setAsking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    try {
      const d = await apiFetch<Doc[]>("/rag/documents");
      setDocs(d);
      if (d.length > 0 && !selectedDoc) setSelectedDoc(d[0].id);
    } catch {
      setDocs([]);
    }
  }, [selectedDoc]);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    } else if (isHydrated && user) {
      loadDocs();
    }
  }, [isHydrated, user, router, loadDocs]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/rag/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Upload gagal");
      await loadDocs();
      setChat((c) => [...c, { role: "ai", content: `📄 Dokumen "${file.name}" berhasil diproses. Silakan tanya apa saja tentang isinya.` }]);
    } catch (e) {
      setChat((c) => [...c, { role: "ai", content: `⚠️ Upload gagal: ${(e as Error).message}` }]);
    } finally {
      setUploading(false);
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || asking) return;
    const q = question.trim();
    setQuestion("");
    setChat((c) => [...c, { role: "user", content: q }]);
    setAsking(true);
    try {
      const data = await apiFetch<Answer>("/rag/ask", {
        method: "POST",
        body: { question: q, doc_id: selectedDoc ?? undefined },
      });
      setChat((c) => [...c, { role: "ai", content: data.answer }]);
    } catch (err) {
      setChat((c) => [
        ...c,
        { role: "ai", content: `⚠️ ${(err as Error).message}` },
      ]);
    } finally {
      setAsking(false);
    }
  }

  async function removeDoc(id: string) {
    try {
      await apiFetch(`/rag/documents/${id}`, { method: "DELETE" });
      setSelectedDoc(null);
      loadDocs();
    } catch {
      // abaikan
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
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-bold">Q&amp;A Laporan Keuangan</h1>
        <p className="mt-1 text-text-muted">
          Upload PDF laporan keuangan → tanya apa saja, AI menjawab berdasarkan dokumen
        </p>

        {/* Upload */}
        <Card className="mt-6">
          <div className="flex flex-wrap items-center gap-4">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Memproses PDF..." : "📤 Upload PDF Laporan"}
            </Button>
            <span className="text-xs text-text-muted">PDF maks 20MB — diproses &amp; diindeks ke vector DB</span>
          </div>

          {/* Daftar dokumen */}
          {docs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {docs.map((d) => (
                <span
                  key={d.id}
                  className={
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm " +
                    (selectedDoc === d.id
                      ? "border-primary/50 bg-primary/10 text-highlight"
                      : "border-white/10 text-text-muted")
                  }
                >
                  <button onClick={() => setSelectedDoc(d.id)}>
                    📄 {d.filename} ({d.chunks} chunk)
                  </button>
                  <button
                    onClick={() => removeDoc(d.id)}
                    className="text-error hover:text-error/70"
                    title="Hapus"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          {docs.length === 0 && (
            <p className="mt-4 text-sm text-text-muted">
              Belum ada dokumen — upload laporan keuangan (PDF) untuk mulai bertanya
            </p>
          )}
        </Card>

        {/* Chat */}
        <Card className="mt-6 flex min-h-[320px] flex-col">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <StatusOrb status={docs.length > 0 ? "success" : "neutral"} label={docs.length > 0 ? `${docs.length} dokumen siap` : "belum ada dokumen"} />
          </div>

          <div className="flex-1 space-y-3 overflow-auto py-4" style={{ maxHeight: 420 }}>
            {chat.length === 0 && (
              <p className="pt-10 text-center text-sm text-text-muted">
                Contoh pertanyaan: &quot;Berapa laba bersih perusahaan ini?&quot; · &quot;Apa rasio ROE-nya?&quot; ·
                &quot;Berapa dividen per saham?&quot;
              </p>
            )}
            {chat.map((m, i) => (
              <div
                key={i}
                className={
                  "max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed " +
                  (m.role === "user"
                    ? "ml-auto bg-primary/20 text-text-primary"
                    : "bg-bg-elevated text-text-secondary")
                }
              >
                {m.content}
              </div>
            ))}
            {asking && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <StatusOrb status="info" pulse /> Mencari di dokumen &amp; menyusun jawaban...
              </div>
            )}
          </div>

          <form onSubmit={ask} className="flex gap-3 border-t border-white/5 pt-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Tanya tentang laporan keuangan..."
              className="flex-1 rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
              disabled={asking || docs.length === 0}
            />
            <Button type="submit" disabled={asking || !question.trim() || docs.length === 0}>
              Kirim
            </Button>
          </form>
        </Card>

        <p className="mt-10 text-xs text-text-disabled">
          ⚖️ Disclaimer: jawaban AI berdasarkan dokumen yang Anda unggah — alat analisis edukatif,
          bukan rekomendasi investasi.
        </p>
      </div>
    </div>
  );
}
