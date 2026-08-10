import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { createClient } from "redis";
import { ApiKeysService } from "../../modules/api-keys/api-keys.service";

/**
 * ApiKeyGuard — proteksi endpoint Public API.
 * - Ambil key dari header `X-API-Key`
 * - Validasi via ApiKeysService (bcrypt compare by prefix)
 * - Rate limiting per key via Redis (default 60 req/menit)
 * - Catat usage ke tabel api_key_usage_logs
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private redis = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    socket: { connectTimeout: 2000 },
  });
  private redisReady = false;

  constructor(private readonly apiKeysService: ApiKeysService) {
    this.redis.connect().then(() => (this.redisReady = true)).catch(() => undefined);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const plainKey = req.headers["x-api-key"] as string | undefined;
    if (!plainKey) {
      throw new HttpException(
        { success: false, error: { code: "MISSING_API_KEY", message: "Header X-API-Key wajib diisi" } },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 1) validasi key
    const apiKey = await this.apiKeysService.validate(plainKey);

    // 2) rate limit via Redis (60 req/menit per key)
    if (this.redisReady) {
      const rkey = `4ig:ratelimit:apikey:${apiKey.id}`;
      const count = await this.redis.incr(rkey);
      if (count === 1) await this.redis.expire(rkey, 60);
      if (count > 60) {
        throw new HttpException(
          { success: false, error: { code: "RATE_LIMITED", message: "Terlalu banyak request (60/menit). Upgrade plan atau tunggu." } },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      req.apiKeyRateCount = count;
    }

    // 3) simpan konteks + catat usage (di interceptor setelah respons)
    req.apiKey = apiKey;
    req.apiKeyUserId = apiKey.userId;
    return true;
  }
}
