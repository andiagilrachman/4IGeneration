import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

/**
 * Endpoint payments — blueprint BAGIAN 8.4:
 * POST /payments/create             → buat transaksi Snap (🔒 login)
 * GET  /payments                    → riwayat pembayaran (🔒)
 * GET  /payments/:id                → detail pembayaran (🔒)
 * POST /payments/webhook/midtrans   → notifikasi dari Midtrans (PUBLIC, signature-verified)
 */
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser("id") userId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(userId, dto.planSlug);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser("id") userId: string) {
    return this.paymentsService.list(userId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  detail(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.paymentsService.detail(userId, id);
  }

  /** Webhook Midtrans — public, tetapi signature diverifikasi. */
  @Post("webhook/midtrans")
  webhook(@Body() payload: Record<string, unknown>) {
    return this.paymentsService.handleWebhook(payload);
  }
}
