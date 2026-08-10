import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { ApiKeyGuard } from "../../common/guards/api-key.guard";
import { ApiKeysService } from "../api-keys/api-keys.service";
import { StocksService } from "../stocks/stocks.service";
import { AnalysisService } from "../analysis/analysis.service";

/**
 * PUBLIC API — untuk developer (W25-30). Semua route butuh API key via header `X-API-Key`.
 * Base: /api/v1/public/*
 *
 * Referensi blueprint BAGIAN 8 (Public API): format standar { success, data, meta },
 * rate limiting per key, usage tracking, versioning.
 */
@Controller("public")
@UseGuards(ApiKeyGuard)
export class PublicController {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly stocksService: StocksService,
    private readonly analysisService: AnalysisService,
  ) {}

  /** Catat usage API key (fire & forget). */
  private logUsage(req: Request, endpoint: string, status = 200) {
    const apiKey = (req as unknown as { apiKey?: { id: string } }).apiKey;
    if (apiKey?.id) {
      void this.apiKeysService.logUsage(apiKey.id, endpoint, status);
    }
  }

  // ---------- STOCKS ----------
  @Get("stocks")
  async listStocks(@Req() req: Request) {
    this.logUsage(req, "GET /public/stocks");
    return this.stocksService.listStocks();
  }

  @Get("stocks/:ticker")
  async getStock(@Req() req: Request, @Param("ticker") ticker: string) {
    this.logUsage(req, `GET /public/stocks/${ticker}`);
    try {
      return await this.stocksService.getStock(ticker);
    } catch {
      throw new BadRequestException("Data saham tidak ditemukan");
    }
  }

  // ---------- ANALYSIS ----------
  @Post("analysis/screener")
  async screener(
    @Req() req: Request,
    @Body()
    body: {
      sector?: string;
      max_pe?: number;
      min_roe?: number;
      limit?: number;
      analyze?: boolean;
    },
  ) {
    this.logUsage(req, "POST /public/analysis/screener");
    if (body.min_roe && body.min_roe > 1) {
      throw new BadRequestException("min_roe harus desimal (mis. 0.15 = 15%)");
    }
    try {
      return await this.analysisService.screener(body);
    } catch {
      throw new BadRequestException("Gagal menjalankan screener");
    }
  }

  @Post("analysis/stock")
  async analyzeStock(@Req() req: Request, @Body() body: { ticker: string }) {
    this.logUsage(req, `POST /public/analysis/stock:${body.ticker ?? ""}`);
    if (!body.ticker) throw new BadRequestException("ticker wajib diisi");
    try {
      // tanpa userId → tidak simpan riwayat, tidak potong kredit (API public MVP)
      return await this.analysisService.analyzeStock(body.ticker);
    } catch {
      throw new BadRequestException("Analisis gagal — cek koneksi AI service");
    }
  }
}
