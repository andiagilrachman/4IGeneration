import { Module } from "@nestjs/common";
import { AnalysisController } from "./analysis.controller";
import { AnalysisService } from "./analysis.service";
import { CreditsModule } from "../credits/credits.module";

/**
 * Analysis module — proxy ke AI Service untuk screener & analisis AI,
 * plus potong kredit (integrasi CreditsModule).
 * TODO (Bulan 3+): endpoint compare/sentiment/chat/market-recap (BAGIAN 8.6).
 */
@Module({
  imports: [CreditsModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
