/**
 * Seed default plans — jalankan: pnpm --filter @4ig/api seed:plans
 * Membuat plan dasar (Free, Starter, Pro) sesuai blueprint BAGIAN 1 & 16
 * (Freemium + Subscription Rp 99K - 999K/bulan).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  {
    slug: "free",
    name: "Free",
    description: "Mulai gratis — analisis terbatas untuk mencoba platform.",
    type: "FREE",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "IDR",
    creditsPerMonth: 10,
    features: {
      analysisPerDay: 3,
      screener: true,
      marketData: true,
      aiSummary: true,
      apiAccess: false,
      support: "Komunitas",
    },
    sortOrder: 0,
  },
  {
    slug: "starter",
    name: "Starter",
    description: "Untuk investor aktif — analisis lebih banyak + riwayat penuh.",
    type: "RETAIL",
    priceMonthly: 99000,
    priceYearly: 990000,
    currency: "IDR",
    creditsPerMonth: 100,
    features: {
      analysisPerDay: 30,
      screener: true,
      marketData: true,
      aiSummary: true,
      apiAccess: false,
      support: "Email",
    },
    sortOrder: 1,
  },
  {
    slug: "pro",
    name: "Pro",
    description: "Untuk trader & analis — akses penuh + prioritas AI.",
    type: "RETAIL",
    priceMonthly: 299000,
    priceYearly: 2990000,
    currency: "IDR",
    creditsPerMonth: 400,
    features: {
      analysisPerDay: 100,
      screener: true,
      marketData: true,
      aiSummary: true,
      apiAccess: false,
      support: "Prioritas",
    },
    sortOrder: 2,
  },
];

async function main() {
  for (const p of PLANS) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        creditsPerMonth: p.creditsPerMonth,
        features: p.features as object,
        sortOrder: p.sortOrder,
        isActive: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        type: p.type as "FREE" | "RETAIL",
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        currency: p.currency,
        creditsPerMonth: p.creditsPerMonth,
        features: p.features as object,
        sortOrder: p.sortOrder,
      },
    });
  }
  const count = await prisma.plan.count();
  console.log(`✅ ${count} plan siap: free, starter, pro`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
