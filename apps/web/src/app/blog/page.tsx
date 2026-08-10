import type { Metadata } from "next";
import Link from "next/link";
import { ParticleField } from "@/components/cosmic/particle-field";
import { blogPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — 4IGeneration",
  description:
    "Artikel edukasi investasi saham Indonesia: panduan screener, analisis fundamental vs teknikal, membaca laporan keuangan dengan AI, dan strategi watchlist.",
};

const CATEGORY_GLOW: Record<string, string> = {
  Panduan: "border-primary/40 text-highlight",
  Edukasi: "border-secondary/40 text-secondary",
  Fitur: "border-accent/40 text-accent",
  Strategi: "border-primary/40 text-highlight",
  Developer: "border-secondary/40 text-secondary",
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <ParticleField density={14} />
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            Wawasan Investasi
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">
            Blog <span className="neon-purple">4IGeneration</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Edukasi pasar modal Indonesia, tips praktis memakai tools AI, dan strategi
            investasi berbasis data.
          </p>
        </div>

        {/* Posts */}
        <div className="mt-12 space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article className="glass-panel p-6 transition-all group-hover:border-primary/40 group-hover:shadow-glow-purple">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={`rounded-full border px-3 py-1 font-mono uppercase tracking-wider ${
                      CATEGORY_GLOW[post.category] ?? "border-white/10 text-text-muted"
                    }`}
                  >
                    {post.category}
                  </span>
                  <span className="text-text-muted">
                    {formatDate(post.date)} · {post.readMinutes} menit baca
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-text-primary transition-colors group-hover:text-highlight">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.excerpt}</p>
                <p className="mt-4 font-mono text-xs text-primary">Baca selengkapnya →</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
