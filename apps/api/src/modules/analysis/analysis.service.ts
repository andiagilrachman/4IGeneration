import { Injectable, Logger } from "@nestjs/common";

/**
 * AnalysisService — proxy ke AI Service (FastAPI) untuk fitur analisis AI.
 * Arsitektur: Web → NestJS (public API) → FastAPI (AI gateway + data) → provider AI
 * Referensi blueprint BAGIAN 8.6 (AI Analysis Endpoints).
 */
@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

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

  /** Analisis 1 saham (data nyata + AI). */
  async analyzeStock(ticker: string) {
    const data = await this.proxy<{ success: boolean; data: unknown }>("/analyze/stock", {
      ticker,
    });
    return data.data;
  }
}
