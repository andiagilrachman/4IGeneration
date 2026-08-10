import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * ApiKeysService — manajemen API key untuk developer (W25-26).
 *
 * Format key: 4IG_<prefix8>_<secret32> (prefix ditampilkan, secret di-hash bcrypt)
 * Scope default: ["stocks:read", "analysis:read"]
 * Referensi blueprint BAGIAN 8.3 + BAGIAN 12 (API security: hashed, prefix 8 chars, rate limit).
 */
@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generate key baru untuk user. Mengembalikan plain key SEKALI SAJA. */
  async create(userId: string, name: string) {
    const prefix = randomBytes(4).toString("hex").toUpperCase();
    const secret = randomBytes(16).toString("hex");
    const plainKey = `4IG_${prefix}_${secret}`;

    const keyHash = await bcrypt.hash(plainKey, 10);
    await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        keyPrefix: prefix,
        keyHash,
        scopes: ["stocks:read", "analysis:read"],
      },
    });

    return { key: plainKey, prefix, name }; // plain key hanya tampil sekali!
  }

  async list(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async revoke(userId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, userId } });
    if (!key) throw new NotFoundException("API key tidak ditemukan");
    await this.prisma.apiKey.update({ where: { id }, data: { isActive: false } });
    return { revoked: true };
  }

  async usage(userId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, userId } });
    if (!key) throw new NotFoundException("API key tidak ditemukan");
    const logs = await this.prisma.apiKeyUsageLog.findMany({
      where: { apiKeyId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const total = await this.prisma.apiKeyUsageLog.count({ where: { apiKeyId: id } });
    return { total, recent: logs };
  }

  /**
   * Validasi API key dari header `X-API-Key` → kembalikan ApiKey + userId.
   * Dipakai guard endpoint publik.
   */
  async validate(plainKey: string) {
    // cari kandidat via prefix (8 char pertama setelah 4IG_)
    const match = plainKey.match(/^4IG_([A-F0-9]{8})_/);
    if (!match) throw new UnauthorizedException("Format API key tidak valid");
    const prefix = match[1];

    const keys = await this.prisma.apiKey.findMany({ where: { keyPrefix: prefix, isActive: true } });
    for (const k of keys) {
      if (await bcrypt.compare(plainKey, k.keyHash)) {
        await this.prisma.apiKey.update({ where: { id: k.id }, data: { lastUsedAt: new Date() } });
        return k;
      }
    }
    throw new UnauthorizedException("API key tidak valid atau sudah dicabut");
  }

  /** Catat penggunaan API key (endpoint + status + token). */
  async logUsage(apiKeyId: string, endpoint: string, statusCode: number, tokensUsed?: number) {
    await this.prisma.apiKeyUsageLog.create({
      data: { apiKeyId, endpoint, statusCode, tokensUsed },
    });
  }
}
