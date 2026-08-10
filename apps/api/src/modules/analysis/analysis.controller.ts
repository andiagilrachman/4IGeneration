import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AnalysisService } from "./analysis.service";

/**
 * Endpoint analisis AI — blueprint BAGIAN 8.6:
 * POST   /analysis/screener   → AI-powered screening (public, data market)
 * POST   /analysis/stock      → analisis 1 saham + simpan riwayat (🔒 login)
 * GET    /analysis/history    → riwayat user (🔒)
 * GET    /analysis/:id        → detail analisis (🔒)
 * DELETE /analysis/:id        → hapus analisis (🔒)
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
  @UseGuards(JwtAuthGuard)
  async analyzeStock(
    @Body() body: { ticker: string },
    @CurrentUser("id") userId: string,
  ) {
    if (!body.ticker) {
      throw new BadRequestException("ticker wajib diisi");
    }
    try {
      return await this.analysisService.analyzeStock(body.ticker, userId);
    } catch {
      throw new BadRequestException(
        `Analisis ${body.ticker} gagal — cek koneksi AI service atau coba lagi`,
      );
    }
  }

  @Post("compare")
  @UseGuards(JwtAuthGuard)
  compare(@Body() body: { tickers?: string[] }) {
    if (!body.tickers || body.tickers.length < 2 || body.tickers.length > 5) {
      throw new BadRequestException("Kirim 2-5 ticker untuk dibandingkan");
    }
    return this.analysisService.compare(body.tickers);
  }

  @Get("export/csv")
  @UseGuards(JwtAuthGuard)
  async exportCsv(
    @CurrentUser("id") userId: string,
    @Res() res: Response,
  ) {
    const csv = await this.analysisService.exportHistoryCsv(userId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="analisis-riwayat.csv"');
    res.send(csv);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser("id") userId: string, @Query("take") take?: string) {
    return this.analysisService.history(userId, take ? Number(take) : 20);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  getOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.analysisService.getOne(userId, id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.analysisService.remove(userId, id);
  }

  @Get("health")
  async health() {
    return { status: "ok", service: "analysis-module" };
  }
}
