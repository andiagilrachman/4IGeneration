import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * WatchlistsService — watchlist saham per user (W33-34).
 * Blueprint BAGIAN 8.8: create, list, detail, add/remove ticker, delete.
 */
@Injectable()
export class WatchlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return items;
  }

  async create(userId: string, name: string, tickers: string[] = []) {
    return this.prisma.watchlist.create({
      data: { userId, name, tickers },
    });
  }

  async detail(userId: string, id: string) {
    const wl = await this.prisma.watchlist.findFirst({ where: { id, userId } });
    if (!wl) throw new NotFoundException("Watchlist tidak ditemukan");
    return wl;
  }

  async addTicker(userId: string, id: string, ticker: string) {
    const wl = await this.detail(userId, id);
    const tickers = (wl.tickers as string[]) ?? [];
    const t = ticker.toUpperCase();
    if (!tickers.includes(t)) {
      tickers.push(t);
      return this.prisma.watchlist.update({ where: { id }, data: { tickers } });
    }
    return wl;
  }

  async removeTicker(userId: string, id: string, ticker: string) {
    const wl = await this.detail(userId, id);
    const tickers = ((wl.tickers as string[]) ?? []).filter((t) => t !== ticker.toUpperCase());
    return this.prisma.watchlist.update({ where: { id }, data: { tickers } });
  }

  async remove(userId: string, id: string) {
    await this.detail(userId, id);
    await this.prisma.watchlist.delete({ where: { id } });
    return { deleted: true };
  }
}
