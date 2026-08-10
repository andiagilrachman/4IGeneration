import Link from "next/link";
import type { Metadata } from "next";
import { ParticleField } from "@/components/cosmic/particle-field";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";
import { AIResponseCard } from "@/components/cosmic/ai-response-card";

export const metadata: Metadata = {
  title: "AI Intelligence Platform for Smart Investing — 4IGeneration",
  description:
    "Analisis & screening saham Indonesia dengan AI. Web tools untuk investor retail + Public API untuk developer, fintech & sekuritas.",
};

/**
 * Landing page (Tier 1: FULL Cosmic Effect — WOW factor).
 * Redesign "4IGeneration v2.1 — Signature Look":
 * meniru layout mockup developer-platform (navbar glass, hero + stats row,
 * 4 pilar fitur, demo AI response, CTA, footer).
 */

const navLinks = [
  { label: "Produk", href: "#features" },
  { label: "Models", href: "#models" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

const stats = [
  { value: "99.99%", label: "Uptime", glow: "purple" as const },
  { value: "20+", label: "Models AI", glow: "blue" as const },
  { value: "10K+", label: "Developers", glow: "cyan" as const },
  { value: "1B+", label: "API Requests", glow: "purple" as const },
];

const pillars = [
  {
    glow: "purple" as const,
    icon: "🧠",
    title: "State-of-the-Art AI Models",
    desc: "Model AI terlatih untuk analisis fundamental & teknikal saham IDX — dari screening hingga rekomendasi berbasis data.",
  },
  {
    glow: "blue" as const,
    icon: "⚡",
    title: "Simple, Fast & Reliable API",
    desc: "REST API siap pakai + SDK JavaScript & Python. Integrasi dalam 5 menit untuk fintech, sekuritas & developer.",
  },
  {
    glow: "cyan" as const,
    icon: "🛰",
    title: "Scalable Infrastructure",
    desc: "Multi-provider AI (Gemini, OpenRouter) dengan fallback otomatis + Redis cache — kencang dan tidak bergantung 1 vendor.",
  },
  {
    glow: "blue" as const,
    icon: "🔒",
    title: "Secure by Design",
    desc: "API key ter-hash (bcrypt), rate limiting, audit log, dan kredit berbasis penggunaan. Data Anda aman.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <ParticleField density={26} />

      {/* ===== NAVBAR — glass sticky ===== */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-bg-deep/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 font-display text-sm font-black text-primary shadow-glow-purple">
              4IG
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              4IG<span className="neon-purple">eneration</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 pt-20 text-center md:pt-28">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-widest text-highlight">
          <StatusOrb status="info" /> 4IG-SMALL · NEURAL CORE ACTIVE
        </span>

        <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Simple AI Infrastructure
          <span className="neon-purple"> for Developers</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Powerful AI models untuk analisis &amp; screening saham Indonesia.
          Web tools untuk investor retail + Public API untuk developer, fintech,
          dan sekuritas — tanpa batas.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
          >
            Get Started
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-white/10 bg-bg-elevated px-8 py-3 font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
          >
            View Documentation
          </Link>
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-panel px-6 py-5 text-center transition-colors hover:border-primary/30"
            >
              <p className="font-display text-3xl font-extrabold text-text-primary">
                {s.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES — 4 PILAR ===== */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            Why 4IGeneration
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Built for the <span className="neon-purple">Next Generation</span> of Investing
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <NeonCard key={p.title} glow={p.glow} title={p.title} subtitle={p.desc}>
              <span className="text-2xl">{p.icon}</span>
            </NeonCard>
          ))}
        </div>
      </section>

      {/* ===== DEMO AI RESPONSE ===== */}
      <section id="models" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-muted">
            Live Demo
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Lihat AI <span className="neon-purple">Bekerja</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <AIResponseCard state="loading" progress={74} />
          <AIResponseCard
            state="completed"
            modelAlias="4IG-Small"
            provider="gemini"
            tokensUsed={428}
            responseTimeMs={1.2}
            content={"BBCA: Likuiditas kuat, ROE 19.2%, rasio utang terkendali.\n\nDisclaimer: alat analisis edukatif, bukan rekomendasi investasi."}
          />
          <AIResponseCard state="error" errorMessage="Provider timeout, retrying..." />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="glass-panel relative overflow-hidden px-8 py-14 text-center">
          <span className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
          <h2 className="font-display text-3xl font-bold">Ready to build?</h2>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">
            Mulai gratis sekarang — dapatkan kredit bulanan dan akses semua tools
            analisis AI untuk investasi cerdas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-white/10 bg-bg-elevated px-8 py-3 font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
            >
              Lihat Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-text-muted md:flex-row">
          <p>© 2026 4IGeneration · AI Intelligence Platform for Smart Investing</p>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-text-secondary">Blog</Link>
            <Link href="/docs" className="hover:text-text-secondary">API Docs</Link>
            <Link href="/pricing" className="hover:text-text-secondary">Pricing</Link>
            <Link href="/login" className="hover:text-text-secondary">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
