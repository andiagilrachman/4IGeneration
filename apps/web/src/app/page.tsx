import Link from "next/link";

/**
 * Landing page dasar (Tier 1: FULL Cosmic Effect — placeholder).
 * TODO (Week 4 roadmap): CosmicHero 3D, ParticleField, waitlist form, dsb.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs tracking-widest text-highlight">
          ◉ 4IG-SMALL · NEURAL CORE ACTIVE
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
            href="/dashboard"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
          >
            Masuk Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 bg-bg-elevated px-6 py-3 font-semibold text-text-secondary transition-colors hover:border-primary/40 hover:text-text-primary"
          >
            Login
          </Link>
        </div>

        <p className="mt-16 font-mono text-xs text-text-muted">
          🚀 Phase 1 · Foundation — monorepo skeleton v0.1.0
        </p>
      </div>
    </main>
  );
}
