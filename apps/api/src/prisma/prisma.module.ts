import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * PrismaModule — global, tersedia di semua module tanpa import ulang.
 * Wajib: skema database sudah di-migrate (`pnpm db:migrate`).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
