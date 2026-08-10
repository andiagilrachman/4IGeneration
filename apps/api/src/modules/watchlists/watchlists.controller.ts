import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsArray, IsOptional, IsString, MaxLength } from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { WatchlistsService } from "./watchlists.service";

class CreateWatchlistDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsArray()
  tickers?: string[];
}

/**
 * Endpoint watchlists — blueprint BAGIAN 8.8 (🔒 login):
 * GET    /watchlists              → daftar watchlist user
 * POST   /watchlists              → buat watchlist
 * GET    /watchlists/:id          → detail
 * POST   /watchlists/:id/tickers  → tambah ticker
 * DELETE /watchlists/:id/tickers/:ticker → hapus ticker
 * DELETE /watchlists/:id          → hapus watchlist
 */
@Controller("watchlists")
@UseGuards(JwtAuthGuard)
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Get()
  list(@CurrentUser("id") userId: string) {
    return this.watchlistsService.list(userId);
  }

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateWatchlistDto) {
    return this.watchlistsService.create(userId, dto.name, dto.tickers);
  }

  @Get(":id")
  detail(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.watchlistsService.detail(userId, id);
  }

  @Post(":id/tickers")
  addTicker(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() body: { ticker: string },
  ) {
    return this.watchlistsService.addTicker(userId, id, body.ticker);
  }

  @Delete(":id/tickers/:ticker")
  removeTicker(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Param("ticker") ticker: string,
  ) {
    return this.watchlistsService.removeTicker(userId, id, ticker);
  }

  @Delete(":id")
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.watchlistsService.remove(userId, id);
  }
}
