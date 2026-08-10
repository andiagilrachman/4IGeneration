import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * MarketRecapService — ringkasan pasar harian (W19-20).
 * - Proxy ke FastAPI /market-recap (berita + data + AI)
 * - Simpan riwayat recap ke DB (analysis_requests, type MARKET_RECAP)
 * - Kirim email ke subscriber (opsional — Resend, nonaktif tanpa key)
 *
 * Referensi blueprint:
 * - BAGIAN 8.6: POST /analysis/market-recap
 * - W19-20 roadmap: scheduled market recap, news fetcher, sentiment, auto-generation, email
 */
@Injectable()
export class MarketRecapService {
  private readonly logger = new Logger(MarketRecapService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  constructor(private readonly prisma: PrismaService) {}

  /** Buat recap baru (opsional: simpan riwayat + kirim email ke user). */
  async generate(userId?: string) {
    const res = await fetch(`${this.baseUrl}/internal/v1/market-recap`, { method: "POST" });
    if (!res.ok) {
      throw new Error(`AI Service error ${res.status} on market-recap`);
    }
    const json = (await res.json()) as { success: boolean; data: unknown };
    const data = json.data as {
      date: string;
      recap: string;
      model_alias?: string;
      news: unknown[];
      top_stocks: unknown[];
    };

    // simpan riwayat (bila user login)
    if (userId) {
      await this.prisma.analysisRequest.create({
        data: {
          userId,
          type: "MARKET_RECAP",
          input: { date: data.date },
          result: data as object,
          modelAlias: data.model_alias ?? null,
          status: "COMPLETED",
        },
      });
    }

    return data;
  }

  /** Riwayat recap milik user. */
  async history(userId: string, take = 10) {
    return this.prisma.analysisRequest.findMany({
      where: { userId, type: "MARKET_RECAP" },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 30),
      select: {
        id: true,
        input: true,
        modelAlias: true,
        createdAt: true,
      },
    });
  }

  /** Detail recap. */
  async detail(userId: string, id: string) {
    const item = await this.prisma.analysisRequest.findFirst({
      where: { id, userId, type: "MARKET_RECAP" },
    });
    if (!item) throw new Error("Recap tidak ditemukan");
    return item;
  }
}
