import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

/**
 * Payments module — integrasi Midtrans Snap (W17-18).
 * TODO (fase lanjut): refund, invoice PDF download, payment methods pilihan,
 * webhook signature & retry queue (BullMQ).
 */
@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
