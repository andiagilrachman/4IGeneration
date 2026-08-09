import { Injectable, Logger } from "@nestjs/common";

/**
 * StocksService — proxy ke AI Service (FastAPI) untuk data saham.
 * Arsitektur: Web → NestJS (public API) → FastAPI (yfinance) → Yahoo Finance
 * Referensi blueprint BAGIAN 8.5 (Stock Data Endpoints).
 */
@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  private async proxy<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}/internal/v1${path}`);
    if (!res.ok) {
      throw new Error(`AI Service error ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  }

  /** Daftar saham IDX likuid. */
  async listStocks() {
    try {
      const data = await this.proxy<{ success: boolean; data: unknown }>("/stocks");
      return data.data;
    } catch (err) {
      this.logger.error(`Gagal ambil daftar saham: ${(err as Error).message}`);
      return [];
    }
  }

  /** Data profil + harga satu saham. */
  async getStock(ticker: string) {
    const data = await this.proxy<{ success: boolean; data: unknown }>(`/stocks/${ticker}`);
    return data.data;
  }
}
