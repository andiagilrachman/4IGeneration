import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { AnalysisService } from "./analysis.service";

/**
 * Endpoint analisis AI — sesuai blueprint BAGIAN 8.6:
 * POST /analysis/screener      → AI-powered screening saham
 * POST /analysis/stock         → analisis 1 saham
 * GET  /analysis/history       → riwayat (fase lanjut, butuh auth + DB)
 */
@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post("screener")
  async screener(
    @Body()
    body: {
      sector?: string;
      max_pe?: number;
      min_roe?: number;
      min_revenue_growth?: number;
      min_profit_margin?: number;
      limit?: number;
      analyze?: boolean;
    },
  ) {
    if (body.min_roe && body.min_roe > 1) {
      throw new BadRequestException("min_roe harus desimal (mis. 0.15 = 15%)");
    }
    try {
      return await this.analysisService.screener(body);
    } catch {
      throw new BadRequestException("Gagal menjalankan screener. Coba lagi.");
    }
  }

  @Post("stock")
  async analyzeStock(@Body() body: { ticker: string }) {
    if (!body.ticker) {
      throw new BadRequestException("ticker wajib diisi");
    }
    try {
      return await this.analysisService.analyzeStock(body.ticker);
    } catch {
      throw new NotFoundException(`Analisis ${body.ticker} gagal — cek koneksi AI service`);
    }
  }

  @Get("health")
  async health() {
    return { status: "ok", service: "analysis-module" };
  }
}
