import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * SubscriptionsService — langganan user ke plan + alokasi kredit.
 * Blueprint BAGIAN 8.4: subscribe, current, upgrade, downgrade, cancel, resume.
 *
 * Catatan MVP:
 * - Belum terhubung payment gateway (Midtrans = fase W17-18) — status langsung ACTIVE
 * - Kredit bulanan dialokasikan saat subscribe (credit_transactions)
 * - Upgrade/downgrade = ganti plan aktif + alokasi kredit baru
 */
@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Subscribe user ke plan (slug). */
  async subscribe(userId: string, planSlug: string) {
    const plan = await this.prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) throw new NotFoundException("Plan tidak ditemukan");

    // batalkan subscription aktif sebelumnya (jika ada)
    await this.prisma.subscription.updateMany({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + 1);

    const sub = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        startsAt: now,
        endsAt,
      },
    });

    // alokasi kredit bulanan (upsert saldo + catat transaksi)
    await this.#allocateCredits(userId, plan.creditsPerMonth, `Kredit bulanan — ${plan.name}`);

    return {
      subscription: sub,
      plan: { slug: plan.slug, name: plan.name, creditsPerMonth: plan.creditsPerMonth },
    };
  }

  /** Subscription aktif milik user. */
  async current(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    const credits = await this.prisma.credit.findUnique({ where: { userId } });
    return {
      subscription: sub,
      credits: credits?.balance ?? 0,
    };
  }

  /** Batalkan subscription (berhenti di akhir periode). */
  async cancel(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
    });
    if (!sub) throw new BadRequestException("Tidak ada subscription aktif");
    const updated = await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    return { cancelled: true, status: updated.status };
  }

  // ------------------------------------------------------------------
  async #allocateCredits(userId: string, amount: number, description: string) {
    if (amount <= 0) return;
    // 1) upsert saldo → dapatkan creditId
    const credit = await this.prisma.credit.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });
    // 2) catat transaksi
    await this.prisma.creditTransaction.create({
      data: {
        creditId: credit.id,
        type: "SUBSCRIPTION_ALLOCATION",
        amount,
        description,
      },
    });
  }
}
