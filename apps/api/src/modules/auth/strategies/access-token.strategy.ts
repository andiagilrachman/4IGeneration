import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  type?: string;
}

/**
 * AccessTokenStrategy — validasi JWT access token dari header
 * "Authorization: Bearer <token>". User di-load dari DB dan disimpan
 * ke request.user (tanpa passwordHash).
 */
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-secret",
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== "access") {
      throw new UnauthorizedException("Token bukan access token");
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== "ACTIVE" || user.deletedAt) {
      throw new UnauthorizedException("User tidak aktif atau tidak ditemukan");
    }
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
