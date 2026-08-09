/**
 * Dashboard skeleton (Tier 2: balanced cosmic).
 * TODO (Week 3-4 roadmap): CommandCenter grid, widget statistik,
 * StockCard, GalaxyChart, integrasi API.
 */
const stats = [
  { label: "Analisis Hari Ini", value: "—" },
  { label: "Watchlist", value: "—" },
  { label: "Saham Dipantau", value: "—" },
  { label: "Kredit Tersisa", value: "—" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Command Center</h1>
        <p className="mt-1 text-text-muted">Dashboard overview — placeholder skeleton</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-5">
              <p className="text-sm text-text-muted">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel mt-6 p-8 text-center text-text-muted">
          🛰 Screener, Analisis Emiten, Playground &amp; Market — menyusul di fase berikutnya
        </div>
      </div>
    </main>
  );
}
