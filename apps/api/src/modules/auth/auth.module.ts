import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

/**
 * Auth module — TODO (Week 2 roadmap):
 * - POST /auth/register  (bcrypt hash password)
 * - POST /auth/login     (JWT access + refresh token)
 * - Passport.js JWT strategy + guards
 * - Redis untuk session management
 * - Email verification (Resend)
 * - 2FA TOTP (fase lanjut)
 */
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "dev-secret",
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL ?? "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
