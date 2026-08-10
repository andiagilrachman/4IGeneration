import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * SettingsService — konfigurasi sistem tersimpan di DB (tabel settings).
 * Prinsip blueprint: "No hardcode — semua konfigurasi di admin panel".
 *
 * Kategori contoh: general, email, payments, security, notifications, integrations.
 * Field isSecret=true → nilai disembunyikan saat GET (diganti "•••").
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.setting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
    // sembunyikan nilai secret
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      key: r.key,
      value: r.isSecret ? "••••••" : r.value,
      isSecret: r.isSecret,
      updatedAt: r.updatedAt,
    }));
  }

  async listByCategory(category: string) {
    const rows = await this.prisma.setting.findMany({
      where: { category },
      orderBy: { key: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      key: r.key,
      value: r.isSecret ? "••••••" : r.value,
      isSecret: r.isSecret,
    }));
  }

  /** Upsert setting (update bila ada, create bila baru). */
  async set(category: string, key: string, value: unknown, isSecret = false) {
    const existing = await this.prisma.setting.findUnique({
      where: { category_key: { category, key } },
    });
    if (existing) {
      return this.prisma.setting.update({
        where: { id: existing.id },
        data: { value: value as object, isSecret: isSecret || existing.isSecret },
      });
    }
    return this.prisma.setting.create({
      data: { category, key, value: value as object, isSecret },
    });
  }

  async remove(category: string, key: string) {
    const existing = await this.prisma.setting.findUnique({
      where: { category_key: { category, key } },
    });
    if (!existing) throw new NotFoundException("Setting tidak ditemukan");
    await this.prisma.setting.delete({ where: { id: existing.id } });
    return { deleted: true };
  }

  /** Ambil nilai mentah (internal — untuk dipakai service lain). */
  async get(category: string, key: string) {
    const row = await this.prisma.setting.findUnique({
      where: { category_key: { category, key } },
    });
    return row?.value ?? undefined;
  }

  /** Kumpulan semua setting dalam satu object (untuk dipakai app). */
  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany();
    const out: Record<string, unknown> = {};
    for (const r of rows) {
      out[`${r.category}.${r.key}`] = r.value;
    }
    return out;
  }
}
