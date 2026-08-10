import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import type { User } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev-secret";
const ACCESS_TTL = () => process.env.JWT_ACCESS_TTL ?? "15m";
const REFRESH_TTL = () => process.env.JWT_REFRESH_TTL ?? "7d";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // email verification & reset: 24 jam
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * AuthService — register, login, refresh, logout, me + email verification & reset password.
 * - Password: bcrypt cost 12 (blueprint BAGIAN 12)
 * - Access token: 15 menit · Refresh token: 7 hari
 * - Session refresh disimpan di tabel `sessions` (hash SHA-256).
 * - Email verification & password reset: token acak 32-byte → hash SHA-256 di DB,
 *   dikirim via Resend (EmailService). Tabel: email_verifications & password_resets.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  // ------------------------------------------------------------------
  private hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ------------------------------------------------------------------
  // Email verification & password reset (W21-22 follow-up)
  // ------------------------------------------------------------------
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private newToken(): string {
    return randomBytes(32).toString("hex");
  }

  /** Kirim email verifikasi (dipanggil saat register & resend). Tidak memblokir alur utama. */
  async sendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerifiedAt) return { sent: false, reason: "noop" };

    const token = this.newToken();
    await this.prisma.emailVerification.create({
      data: { email, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const link = `${APP_URL()}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f1424; color: #f8fafc; border-radius: 16px;">
        <h2 style="color: #a78bfa;">✅ Verifikasi Email — 4IGeneration</h2>
        <p>Halo <strong>${user.name ?? user.email}</strong>,</p>
        <p>Terima kasih sudah mendaftar! Klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 28px; background: #7c3aed; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600;">Verifikasi Email</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">Atau salin tautan ini: <a href="${link}" style="color: #a78bfa;">${link}</a></p>
        <p style="color: #94a3b8; font-size: 12px;">Tautan berlaku 24 jam. Jika Anda tidak mendaftar, abaikan email ini.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">© 4IGeneration</p>
      </div>`;
    const res = await this.email.send(email, "Verifikasi Email — 4IGeneration", html);
    if (!res.sent) this.logger.warn(`Email verifikasi gagal dikirim ke ${email}`);
    return { sent: res.sent };
  }

  /** Verifikasi email via token (POST /auth/verify-email). */
  async verifyEmail(token: string) {
    const rec = await this.prisma.emailVerification.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!rec || rec.usedAt) throw new BadRequestException("Token verifikasi tidak valid atau sudah dipakai");
    if (rec.expiresAt < new Date()) throw new BadRequestException("Token verifikasi sudah kedaluwarsa");

    await this.prisma.$transaction([
      this.prisma.emailVerification.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
      this.prisma.user.updateMany({
        where: { email: rec.email },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
    return { verified: true, email: rec.email };
  }

  /** Kirim email reset password (POST /auth/forgot-password). */
  async forgotPassword(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    // Jangan bocorkan keberadaan email — balas sukses apa pun.
    if (!user) return { sent: false };

    const token = this.newToken();
    await this.prisma.passwordReset.create({
      data: { email: normalized, tokenHash: this.hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const link = `${APP_URL()}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f1424; color: #f8fafc; border-radius: 16px;">
        <h2 style="color: #a78bfa;">🔑 Reset Password — 4IGeneration</h2>
        <p>Halo <strong>${user.name ?? user.email}</strong>,</p>
        <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 28px; background: #7c3aed; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">Atau salin tautan ini: <a href="${link}" style="color: #a78bfa;">${link}</a></p>
        <p style="color: #94a3b8; font-size: 12px;">Tautan berlaku 24 jam. Jika Anda tidak meminta reset, abaikan email ini.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">© 4IGeneration</p>
      </div>`;
    const res = await this.email.send(normalized, "Reset Password — 4IGeneration", html);
    if (!res.sent) this.logger.warn(`Email reset gagal dikirim ke ${normalized}`);
    return { sent: res.sent };
  }

  /** Set password baru via token (POST /auth/reset-password). */
  async resetPassword(token: string, newPassword: string) {
    const rec = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!rec || rec.usedAt) throw new BadRequestException("Token reset tidak valid atau sudah dipakai");
    if (rec.expiresAt < new Date()) throw new BadRequestException("Token reset sudah kedaluwarsa");

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
      this.prisma.user.updateMany({
        where: { email: rec.email },
        data: { passwordHash },
      }),
      // revoke semua session user terkait email
      this.prisma.session.updateMany({
        where: { user: { email: rec.email }, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { reset: true, email: rec.email };
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
        // email verification dikirim otomatis setelah register (tidak memblokir login)
        status: "ACTIVE",
        profile: dto.name ? { create: { fullName: dto.name } } : undefined,
      },
    });

    // kirim email verifikasi (fire-and-forget — kegagalan email tidak menggagalkan register)
    void this.sendVerificationEmail(email).catch((err) =>
      this.logger.warn(`Gagal kirim verifikasi saat register: ${(err as Error).message}`),
    );

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
