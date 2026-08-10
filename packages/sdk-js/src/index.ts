/**
 * 4IGeneration — JavaScript/TypeScript SDK
 *
 * Akses Public API 4IGeneration dengan mudah dari aplikasi Node.js / browser.
 * Butuh API key: buat di dashboard → halaman API Keys.
 *
 * Contoh:
 *   import { FourIG } from "@4ig/sdk-js";
 *   const client = new FourIG({ apiKey: "4IG_XXXX_YYYY" });
 *   const stocks = await client.stocks.list();
 */

export interface FourIGOptions {
  apiKey: string;
  /** Base URL API. Default: http://localhost:3001/api/v1 (ganti ke https://api.4igeneration.com/v1 di produksi) */
  baseUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { timestamp: string; request_id: string };
}

/** Error dari API dengan kode & status. */
export class FourIGError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class FourIG {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: FourIGOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "http://localhost:3001/api/v1").replace(/\/$/, "");
    this.stocks = new Stocks(this);
    this.analysis = new Analysis(this);
  }

  /** Akses endpoint stocks. */
  stocks: Stocks;
  /** Akses endpoint analysis. */
  analysis: Analysis;

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!res.ok || !json || json.success === false) {
      const err = json && "error" in json ? (json as { error: { code: string; message: string } }).error : null;
      throw new FourIGError(res.status, err?.code ?? "HTTP_ERROR", err?.message ?? `HTTP ${res.status}`);
    }
    return json.data;
  }
}

/** Endpoint data saham. */
export class Stocks {
  constructor(private client: FourIG) {}

  /** Daftar saham IDX. */
  list() {
    return this.client.request<unknown[]>("GET", "/public/stocks");
  }

  /** Data detail satu saham (harga, ROE, PE, dll). */
  detail(ticker: string) {
    return this.client.request<Record<string, unknown>>("GET", `/public/stocks/${ticker.toUpperCase()}`);
  }
}

export interface ScreenerCriteria {
  sector?: string;
  max_pe?: number;
  min_roe?: number;
  min_revenue_growth?: number;
  min_profit_margin?: number;
  limit?: number;
  analyze?: boolean;
}

/** Endpoint analisis AI. */
export class Analysis {
  constructor(private client: FourIG) {}

  /** Screener fundamental saham IDX. */
  screener(criteria: ScreenerCriteria = {}) {
    return this.client.request<Record<string, unknown>>("POST", "/public/analysis/screener", criteria);
  }

  /** Analisis 1 saham (data nyata + AI). */
  stock(ticker: string) {
    return this.client.request<Record<string, unknown>>("POST", "/public/analysis/stock", {
      ticker: ticker.toUpperCase(),
    });
  }
}
