import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsString } from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SubscriptionsService } from "./subscriptions.service";

class SubscribeDto {
  @IsString()
  planSlug: string;
}

/**
 * Endpoint subscriptions — blueprint BAGIAN 8.4 (semua 🔒 login):
 * GET  /subscriptions/current   → subscription aktif + saldo kredit
 * POST /subscriptions/subscribe → subscribe ke plan (slug)
 * POST /subscriptions/cancel    → batalkan subscription
 */
@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("current")
  current(@CurrentUser("id") userId: string) {
    return this.subscriptionsService.current(userId);
  }

  @Post("subscribe")
  subscribe(@CurrentUser("id") userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.subscribe(userId, dto.planSlug);
  }

  @Post("cancel")
  cancel(@CurrentUser("id") userId: string) {
    return this.subscriptionsService.cancel(userId);
  }
}
