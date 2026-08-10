import Link from "next/link";
import { ParticleField } from "@/components/cosmic/particle-field";
import { NeonCard } from "@/components/cosmic/neon-card";
import { StatusOrb } from "@/components/cosmic/status-orb";
import { AIResponseCard } from "@/components/cosmic/ai-response-card";

/**
 * Landing page (Tier 1: FULL Cosmic Effect — WOW factor).
 * Menampilkan komponen design system cosmic (BAGIAN 5).
 */

const features = [
  {
    glow: "purple" as const,
    title: "AI Stock Analysis",
    desc: "Analisis fundamental & teknikal otomatis dengan AI yang paham konteks pasar Indonesia.",
  },
  {
    glow: "blue" as const,
    title: "Smart Screener",
    desc: "Saring ribuan saham IDX berdasarkan kriteria yang bisa Anda atur sendiri.",
  },
  {
    glow: "cyan" as const,
    title: "Public API",
    desc: "Integrasikan analisis AI ke aplikasi Anda — untuk developer, fintech & sekuritas.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <ParticleField density={28} />

      {/* HERO */}
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-widest text-highlight">
          <StatusOrb status="info" /> 4IG-SMALL · NEURAL CORE ACTIVE
        </span>

        <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Simple AI Infrastructure
          <span className="neon-purple"> for Developers</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-text-secondary">
          AI-native platform untuk analisis &amp; screening saham Indonesia.
          Web tools untuk investor retail + Public API untuk developer, fintech, dan sekuritas.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-7 py-3 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
          >
            Mulai Gratis
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-white/10 bg-bg-elevated px-7 py-3 font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
          >
            Lihat Harga
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 bg-bg-elevated px-7 py-3 font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
          >
            Login
          </Link>
        </div>

        <p className="mt-16 font-mono text-xs text-text-muted">
          🚀 Phase 1 · Foundation — Design System Cosmic v0.1
        </p>
      </div>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <NeonCard key={f.title} glow={f.glow} title={f.title} subtitle={f.desc} />
          ))}
        </div>

        {/* AI Response demo */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
    </main>
  );
}
