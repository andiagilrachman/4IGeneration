import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

/**
 * Admin module — AI configuration management (blueprint BAGIAN 9).
 * TODO (fase lanjut): settings, feature-flags, prompts, content,
 * email-templates, audit-logs, users management (BAGIAN 8.10).
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
