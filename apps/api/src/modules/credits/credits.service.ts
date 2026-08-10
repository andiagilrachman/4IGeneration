import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * CreditsService — saldo & riwayat kredit user.
 * Blueprint BAGIAN 8.4: GET /credits/balance, GET /credits/transactions.
 *
 * Kredit dikurangi saat user memakai fitur AI (analysis) — lihat
 * AnalysisService.spendCredit. Alokasi: saat subscribe (W15-16).
 */
@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async balance(userId: string) {
    const credit = await this.prisma.credit.findUnique({ where: { userId } });
    return { balance: credit?.balance ?? 0 };
  }

  async transactions(userId: string, take = 50) {
    const credit = await this.prisma.credit.findUnique({ where: { userId } });
    if (!credit) return [];
    return this.prisma.creditTransaction.findMany({
      where: { creditId: credit.id },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 100),
    });
  }

  /**
   * Kurangi saldo kredit user. Throw bila saldo tidak cukup.
   * Dipanggil AnalysisService sebelum menjalankan analisis AI.
   */
  async spend(userId: string, amount: number, description: string, referenceId?: string) {
    if (amount <= 0) return { balance: 0, spent: 0 };

    return this.prisma.$transaction(async (tx) => {
      const credit = await tx.credit.findUnique({ where: { userId } });
      const current = credit?.balance ?? 0;
      if (current < amount) {
        throw new BadRequestException(
          `Kredit tidak cukup (${current}). Subscribe plan atau tunggu alokasi berikutnya.`,
        );
      }
      await tx.credit.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });
      await tx.creditTransaction.create({
        data: {
          creditId: credit!.id,
          type: "USAGE_DEDUCTION",
          amount: -amount,
          description,
          referenceId,
        },
      });
      return { balance: current - amount, spent: amount };
    });
  }
}
