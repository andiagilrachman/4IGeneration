import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MarketRecapService } from "./market-recap.service";

/**
 * Endpoint market recap — blueprint BAGIAN 8.6:
 * POST /analysis/market-recap   → buat recap harian (🔒 login, tersimpan)
 * GET  /analysis/market-recap/history → riwayat recap (🔒)
 * GET  /analysis/market-recap/:id     → detail (🔒)
 */
@Controller("analysis/market-recap")
@UseGuards(JwtAuthGuard)
export class MarketRecapController {
  constructor(private readonly marketRecapService: MarketRecapService) {}

  @Post()
  generate(@CurrentUser("id") userId: string) {
    return this.marketRecapService.generate(userId);
  }

  @Get("history")
  history(@CurrentUser("id") userId: string, @Query("take") take?: string) {
    return this.marketRecapService.history(userId, take ? Number(take) : 10);
  }

  @Get(":id")
  detail(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.marketRecapService.detail(userId, id);
  }
}
