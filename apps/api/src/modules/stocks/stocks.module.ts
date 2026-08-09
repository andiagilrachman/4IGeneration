import { Module } from "@nestjs/common";
import { StocksController } from "./stocks.controller";
import { StocksService } from "./stocks.service";

/**
 * Stocks module — data saham IDX via proxy ke AI Service (FastAPI).
 * TODO (Week 10-11): seed tabel `stocks` MySQL, cache Redis,
 * endpoints prices/fundamentals/news/technicals (BAGIAN 8.5).
 */
@Module({
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
