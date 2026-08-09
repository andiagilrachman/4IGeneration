"use client";

/**
 * Halaman Login (Tier 3: minimal cosmic).
 * TODO (Week 3 roadmap): integrasi API /auth/login via TanStack Query + React Hook Form + Zod.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-deep bg-cosmic-radial px-6">
      <div className="glass-panel w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-bold">Masuk</h1>
        <p className="mt-1 text-sm text-text-muted">4IGeneration — AI Intelligence Platform</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: panggil POST /api/v1/auth/login
          }}
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-lg border border-white/10 bg-bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white shadow-glow-purple transition-colors hover:bg-primary-hover"
          >
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-xs text-text-muted">
          Auth belum terhubung ke backend — placeholder scaffold
        </p>
      </div>
    </main>
  );
}
