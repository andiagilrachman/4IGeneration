import { Module } from "@nestjs/common";
import { MarketRecapController } from "./market-recap.controller";
import { MarketRecapService } from "./market-recap.service";

@Module({
  controllers: [MarketRecapController],
  providers: [MarketRecapService],
  exports: [MarketRecapService],
})
export class MarketRecapModule {}
