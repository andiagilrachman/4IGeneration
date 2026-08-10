import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { ApiKeysModule } from "../api-keys/api-keys.module";
import { StocksModule } from "../stocks/stocks.module";
import { AnalysisModule } from "../analysis/analysis.module";

/**
 * Public API module (Phase 3) — endpoint developer dengan API key.
 */
@Module({
  imports: [ApiKeysModule, StocksModule, AnalysisModule],
  controllers: [PublicController],
})
export class PublicModule {}
