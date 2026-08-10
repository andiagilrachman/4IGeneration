import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CreditsService } from "./credits.service";

/**
 * Endpoint credits — blueprint BAGIAN 8.4 (🔒 login):
 * GET /credits/balance       → saldo kredit user
 * GET /credits/transactions  → riwayat transaksi kredit
 */
@Controller("credits")
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get("balance")
  balance(@CurrentUser("id") userId: string) {
    return this.creditsService.balance(userId);
  }

  @Get("transactions")
  transactions(@CurrentUser("id") userId: string, @Query("take") take?: string) {
    return this.creditsService.transactions(userId, take ? Number(take) : 50);
  }
}
