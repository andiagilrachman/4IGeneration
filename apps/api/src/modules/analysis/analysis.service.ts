import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreditsService } from "../credits/credits.service";

const CREDIT_COST_PER_ANALYSIS = 1; // 1 kredit per analisis saham (MVP)

/**
 * AnalysisService — analisis AI 1 saham + simpan riwayat + potong kredit.
 * Arsitektur: Web → NestJS (auth + credit + save) → FastAPI (AI gateway + data) → provider AI
 *
 * Referensi blueprint:
 * - BAGIAN 8.6: POST /analysis/stock, GET /analysis/history, GET /analysis/:id, DELETE /analysis/:id
 * - W13-14 roadmap: Analisis Emiten + save history
 * - W15-16 roadmap: integrasi credits — setiap analisis memakai kredit
 */
@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {}

  private async proxy<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}/internal/v1${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`AI Service error ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  }

  /** AI-powered screener — data-driven + opsi analisis AI. */
  async screener(criteria: Record<string, unknown>) {
    try {
      const data = await this.proxy<{ success: boolean; data: unknown }>("/screen", criteria);
      return data.data;
    } catch (err) {
      this.logger.error(`Screener gagal: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Analisis 1 saham (data nyata + AI), potong kredit, lalu simpan ke DB.
   * Butuh userId (dari JWT) — riwayat & kredit per user.
   */
  async analyzeStock(ticker: string, userId?: string) {
    // 1) potong kredit sebelum eksekusi (user login saja; anonim = tidak diproses)
    let creditInfo = { balance: 0, spent: 0 };
    if (userId) {
      creditInfo = await this.creditsService.spend(
        userId,
        CREDIT_COST_PER_ANALYSIS,
        `Analisis saham ${ticker.toUpperCase()}`,
      );
    }

    // 2) jalankan analisis AI
    const data = await this.proxy<{ success: boolean; data: unknown }>("/analyze/stock", {
      ticker,
    });
    const result = (data as { success: boolean; data: unknown }).data as {
      provider?: string;
      model?: string;
      model_alias?: string;
      content?: string;
      stock_data?: string | null;
      response_time_ms?: number;
    };

    // 3) simpan ke DB bila user login (riwayat)
    let saved: { id: string } | null = null;
    if (userId) {
      saved = await this.prisma.analysisRequest.create({
        data: {
          userId,
          type: "STOCK",
          input: { ticker: ticker.toUpperCase() },
          result: result as object,
          provider: result.provider ?? null,
          modelAlias: result.model_alias ?? null,
          status: "COMPLETED",
          creditsCost: creditInfo.spent,
          responseTimeMs: result.response_time_ms ?? null,
        },
        select: { id: true },
      });
    }

    return {
      ...result,
      id: saved?.id ?? null,
      credits: creditInfo,
    };
  }

  /** Bandingkan 2-5 saham (data nyata + AI summary). */
  async compare(tickers: string[]) {
    const data = await this.proxy<{ success: boolean; data: unknown }>("/analyze/compare", {
      tickers,
    });
    return data.data;
  }

  /** Export riwayat analisis ke CSV (string). */
  exportHistoryCsv(userId: string): Promise<string> {
    return this.prisma.analysisRequest
      .findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 500,
      })
      .then((rows) => {
        const header = "id,tanggal,tipe,provider,model,status,biaya_kredit\n";
        const lines = rows.map((r) => {
          const meta = (r.result as { provider?: string } | null) ?? {};
          return [
            r.id,
            r.createdAt.toISOString(),
            r.type,
            meta.provider ?? r.provider ?? "",
            r.modelAlias ?? "",
            r.status,
            r.creditsCost ?? "",
          ]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",");
        });
        return header + lines.join("\n");
      });
  }

  /** Riwayat analisis milik user (terbaru di atas). */
  async history(userId: string, take = 20) {
    return this.prisma.analysisRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 50),
      select: {
        id: true,
        type: true,
        input: true,
        provider: true,
        modelAlias: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /** Detail satu analisis (hanya milik user yang sama). */
  async getOne(userId: string, id: string) {
    const item = await this.prisma.analysisRequest.findFirst({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException("Analisis tidak ditemukan");
    return item;
  }

  /** Hapus analisis (hanya milik user yang sama). */
  async remove(userId: string, id: string) {
    const item = await this.getOne(userId, id);
    await this.prisma.analysisRequest.delete({ where: { id: item.id } });
    return { deleted: true };
  }
}
