import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateModelDto, UpdateModelDto } from "./dto/model.dto";
import { CreateProviderDto, UpdateProviderDto } from "./dto/provider.dto";
import {
  CreateProviderKeyDto,
  UpdateKeyStatusDto,
  UpdateProviderKeyDto,
} from "./dto/provider-key.dto";

/**
 * AdminService — CRUD untuk AI configuration (blueprint BAGIAN 9: AI CONFIGURATION).
 * Prinsip "no hardcode": provider, keys, dan model dikelola dari DB via admin panel,
 * bukan dari kode/env.
 *
 * TODO (fase lanjut):
 * - Enkripsi AES-256 untuk API keys (sekarang disimpan mentah, MVP)
 * - Sync config ini ke AI Gateway (FastAPI) — endpoint /internal/v1/providers/reload
 * - Audit log untuk setiap aksi admin
 */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------------
  // DASHBOARD
  // ------------------------------------------------------------------
  async dashboardStats() {
    const [providers, keys, models, users] = await Promise.all([
      this.prisma.aiProvider.count(),
      this.prisma.providerKey.count(),
      this.prisma.aiModel.count(),
      this.prisma.user.count(),
    ]);
    const activeProviders = await this.prisma.aiProvider.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, priority: true, isActive: true },
      orderBy: { priority: "asc" },
    });
    return { providers, keys, models, users, activeProviders };
  }

  // ------------------------------------------------------------------
  // PROVIDERS
  // ------------------------------------------------------------------
  async listProviders() {
    return this.prisma.aiProvider.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { keys: true, models: true } } },
    });
  }

  async getProvider(id: string) {
    const p = await this.prisma.aiProvider.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Provider tidak ditemukan");
    return p;
  }

  createProvider(dto: CreateProviderDto) {
    return this.prisma.aiProvider.create({
      data: {
        slug: dto.slug.toLowerCase().trim(),
        name: dto.name,
        baseUrl: dto.baseUrl,
        authType: dto.authType ?? "api_key_header",
        priority: dto.priority ?? 100,
        weight: dto.weight ?? 0,
        timeoutMs: dto.timeoutMs ?? 30000,
        maxRetries: dto.maxRetries ?? 3,
        healthPath: dto.healthPath,
        config: (dto.config as object) ?? undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateProvider(id: string, dto: UpdateProviderDto) {
    await this.getProvider(id);
    return this.prisma.aiProvider.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: dto.slug.toLowerCase().trim() } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.baseUrl !== undefined ? { baseUrl: dto.baseUrl } : {}),
        ...(dto.authType !== undefined ? { authType: dto.authType } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.weight !== undefined ? { weight: dto.weight } : {}),
        ...(dto.timeoutMs !== undefined ? { timeoutMs: dto.timeoutMs } : {}),
        ...(dto.maxRetries !== undefined ? { maxRetries: dto.maxRetries } : {}),
        ...(dto.healthPath !== undefined ? { healthPath: dto.healthPath } : {}),
        ...(dto.config !== undefined ? { config: dto.config as object } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteProvider(id: string) {
    await this.getProvider(id);
    // hapus juga keys & models terkait (cascade by DB)
    await this.prisma.aiProvider.delete({ where: { id } });
    return { deleted: true };
  }

  // ------------------------------------------------------------------
  // PROVIDER KEYS
  // ------------------------------------------------------------------
  async listKeys(providerId?: string) {
    return this.prisma.providerKey.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { provider: { select: { slug: true, name: true } } },
    });
  }

  createKey(dto: CreateProviderKeyDto) {
    return this.prisma.providerKey.create({
      data: {
        providerId: dto.providerId,
        label: dto.label,
        encryptedKey: dto.encryptedKey,
        status: dto.status ?? "ACTIVE",
        dailyLimit: dto.dailyLimit ?? 1500,
        monthlyLimit: dto.monthlyLimit ?? 45000,
      },
    });
  }

  async updateKey(id: string, dto: UpdateProviderKeyDto) {
    const k = await this.prisma.providerKey.findUnique({ where: { id } });
    if (!k) throw new NotFoundException("Key tidak ditemukan");
    return this.prisma.providerKey.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.encryptedKey !== undefined ? { encryptedKey: dto.encryptedKey } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.dailyLimit !== undefined ? { dailyLimit: dto.dailyLimit } : {}),
        ...(dto.monthlyLimit !== undefined ? { monthlyLimit: dto.monthlyLimit } : {}),
      },
    });
  }

  async setKeyStatus(id: string, dto: UpdateKeyStatusDto) {
    const k = await this.prisma.providerKey.findUnique({ where: { id } });
    if (!k) throw new NotFoundException("Key tidak ditemukan");
    return this.prisma.providerKey.update({ where: { id }, data: { status: dto.status } });
  }

  async deleteKey(id: string) {
    const k = await this.prisma.providerKey.findUnique({ where: { id } });
    if (!k) throw new NotFoundException("Key tidak ditemukan");
    await this.prisma.providerKey.delete({ where: { id } });
    return { deleted: true };
  }

  // ------------------------------------------------------------------
  // MODELS
  // ------------------------------------------------------------------
  async listModels(providerId?: string) {
    return this.prisma.aiModel.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { provider: { select: { slug: true, name: true } } },
    });
  }

  createModel(dto: CreateModelDto) {
    return this.prisma.aiModel.create({
      data: {
        providerId: dto.providerId,
        modelId: dto.modelId,
        alias: dto.alias,
        contextWindow: dto.contextWindow ?? 128000,
        priceInput: dto.priceInput ?? 0,
        priceOutput: dto.priceOutput ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateModel(id: string, dto: UpdateModelDto) {
    const m = await this.prisma.aiModel.findUnique({ where: { id } });
    if (!m) throw new NotFoundException("Model tidak ditemukan");
    return this.prisma.aiModel.update({
      where: { id },
      data: {
        ...(dto.providerId !== undefined ? { providerId: dto.providerId } : {}),
        ...(dto.modelId !== undefined ? { modelId: dto.modelId } : {}),
        ...(dto.alias !== undefined ? { alias: dto.alias } : {}),
        ...(dto.contextWindow !== undefined ? { contextWindow: dto.contextWindow } : {}),
        ...(dto.priceInput !== undefined ? { priceInput: dto.priceInput } : {}),
        ...(dto.priceOutput !== undefined ? { priceOutput: dto.priceOutput } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteModel(id: string) {
    const m = await this.prisma.aiModel.findUnique({ where: { id } });
    if (!m) throw new NotFoundException("Model tidak ditemukan");
    await this.prisma.aiModel.delete({ where: { id } });
    return { deleted: true };
  }

  // ------------------------------------------------------------------
  // PLANS (kelola harga & kuota plan)
  // ------------------------------------------------------------------
  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  }

  createPlan(dto: Record<string, unknown>) {
    return this.prisma.plan.create({
      data: {
        slug: String(dto.slug ?? "").toLowerCase().trim(),
        name: String(dto.name ?? ""),
        description: dto.description ? String(dto.description) : undefined,
        type: (dto.type as "FREE" | "RETAIL" | "API" | "ENTERPRISE") ?? "RETAIL",
        priceMonthly: Number(dto.priceMonthly ?? 0),
        priceYearly: dto.priceYearly !== undefined ? Number(dto.priceYearly) : null,
        currency: String(dto.currency ?? "IDR"),
        creditsPerMonth: Number(dto.creditsPerMonth ?? 0),
        features: (dto.features as object) ?? undefined,
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
        sortOrder: Number(dto.sortOrder ?? 0),
      },
    });
  }

  async updatePlan(id: string, dto: Record<string, unknown>) {
    const p = await this.prisma.plan.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Plan tidak ditemukan");
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: String(dto.slug).toLowerCase().trim() } : {}),
        ...(dto.name !== undefined ? { name: String(dto.name) } : {}),
        ...(dto.description !== undefined ? { description: String(dto.description) } : {}),
        ...(dto.type !== undefined ? { type: dto.type as never } : {}),
        ...(dto.priceMonthly !== undefined ? { priceMonthly: Number(dto.priceMonthly) } : {}),
        ...(dto.priceYearly !== undefined ? { priceYearly: Number(dto.priceYearly) } : {}),
        ...(dto.currency !== undefined ? { currency: String(dto.currency) } : {}),
        ...(dto.creditsPerMonth !== undefined ? { creditsPerMonth: Number(dto.creditsPerMonth) } : {}),
        ...(dto.features !== undefined ? { features: dto.features as object } : {}),
        ...(dto.isActive !== undefined ? { isActive: Boolean(dto.isActive) } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: Number(dto.sortOrder) } : {}),
      },
    });
  }

  async deletePlan(id: string) {
    const p = await this.prisma.plan.findUnique({ where: { id } });
    if (!p) throw new NotFoundException("Plan tidak ditemukan");
    await this.prisma.plan.delete({ where: { id } });
    return { deleted: true };
  }
}
