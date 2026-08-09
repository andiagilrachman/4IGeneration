import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { StocksService } from "./stocks.service";

/**
 * Endpoint data saham — sesuai blueprint BAGIAN 8.5:
 * GET /stocks          → daftar saham IDX (paginated di fase lanjut)
 * GET /stocks/:ticker  → profil + harga
 * GET /stocks/search?q= → cari saham (fase lanjut)
 */
@Controller("stocks")
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  async list() {
    return this.stocksService.listStocks();
  }

  @Get(":ticker")
  async detail(@Param("ticker") ticker: string) {
    try {
      return await this.stocksService.getStock(ticker);
    } catch {
      throw new NotFoundException(`Data saham ${ticker} tidak ditemukan`);
    }
  }
}
