"use client";

/**
 * ParticleField — background partikel kosmik (CSS murni, tanpa 3D).
 * Mobile (<768px): dimatikan otomatis via CSS (efek reduction blueprint BAGIAN 5).
 */

interface ParticleFieldProps {
  density?: number; // jumlah partikel (default 24)
}

export function ParticleField({ density = 24 }: ParticleFieldProps) {
  // partikel statis dengan posisi/acak deterministik
  const particles = Array.from({ length: density }, (_, i) => {
    const left = (i * 37 + 13) % 100;
    const top = (i * 53 + 7) % 100;
    const size = 1 + ((i * 7) % 3);
    const delay = ((i * 13) % 20) / 10;
    const duration = 8 + ((i * 5) % 10);
    return { left, top, size, delay, duration };
  });

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden md:block" aria-hidden="true">
      {/* nebula gradients */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

      {/* bintang berkelip */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-pulse rounded-full bg-text-muted"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}
