import { Module } from "@nestjs/common";
import { MarketRecapController } from "./market-recap.controller";
import { MarketRecapService } from "./market-recap.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [MarketRecapController],
  providers: [MarketRecapService],
  exports: [MarketRecapService],
})
export class MarketRecapModule {}
