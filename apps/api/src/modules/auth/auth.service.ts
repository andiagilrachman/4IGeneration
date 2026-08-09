import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash } from "crypto";
import type { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev-secret";
const ACCESS_TTL = () => process.env.JWT_ACCESS_TTL ?? "15m";
const REFRESH_TTL = () => process.env.JWT_REFRESH_TTL ?? "7d";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * AuthService — register, login, refresh, logout, me.
 * - Password: bcrypt cost 12 (blueprint BAGIAN 12)
 * - Access token: 15 menit · Refresh token: 7 hari
 * - Session refresh disimpan di tabel `sessions` (hash SHA-256).
 *   TODO lanjutan: pindah session ke Redis + 2FA TOTP + email verification (Resend).
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ------------------------------------------------------------------
  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async issueTokens(userId: string) {
    // 1) buat session (tokenHash diisi setelah refresh token dibuat)
    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash: "",
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    // 2) refresh token berisi session id (untuk revoke)
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, type: "refresh", sid: session.id },
      { secret: REFRESH_SECRET(), expiresIn: REFRESH_TTL() },
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: { tokenHash: this.hashRefreshToken(refreshToken) },
    });

    // 3) access token pendek
    const accessToken = await this.jwt.signAsync(
      { sub: userId, type: "access" },
      { expiresIn: ACCESS_TTL() },
    );

    return { accessToken, refreshToken, sessionId: session.id };
  }

  // ------------------------------------------------------------------
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email sudah terdaftar");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name,
        // TODO (fase lanjut): status PENDING_VERIFICATION + kirim email verifikasi via Resend
        status: "ACTIVE",
        profile: dto.name ? { create: { fullName: dto.name } } : undefined,
      },
    });

    const tokens = await this.issueTokens(user.id);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Email atau password salah");
    }
    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("Akun tidak aktif");
    }

    const tokens = await this.issueTokens(user.id);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; type?: string; sid?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: REFRESH_SECRET() });
    } catch {
      throw new UnauthorizedException("Refresh token tidak valid atau kedaluwarsa");
    }
    if (payload.type !== "refresh" || !payload.sid) {
      throw new UnauthorizedException("Token bukan refresh token");
    }

    const session = await this.prisma.session.findUnique({ where: { id: payload.sid } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session tidak aktif atau sudah berakhir");
    }
    if (session.tokenHash !== this.hashRefreshToken(refreshToken)) {
      throw new UnauthorizedException("Session tidak cocok");
    }

    // rotasi: revoke session lama, buat baru
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(payload.sub);
  }

  async logout(refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: { tokenHash: this.hashRefreshToken(refreshToken), revokedAt: null },
    });
    if (session) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
    return { loggedOut: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) {
      throw new UnauthorizedException("User tidak ditemukan");
    }
    return this.sanitize(user);
  }
}
