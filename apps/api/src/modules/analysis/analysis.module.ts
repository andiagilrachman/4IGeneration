import { Module } from "@nestjs/common";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";

/**
 * Analysis module — proxy ke AI Service untuk screener & analisis AI.
 * TODO (Bulan 3+): simpan analysis_requests ke DB, deduksi kredit,
 * endpoint compare/sentiment/chat/market-recap (BAGIAN 8.6).
 */
@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
