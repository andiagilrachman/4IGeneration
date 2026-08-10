import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

/**
 * ApiUsageInterceptor — catat penggunaan API key setelah respons selesai.
 * Dipasang pada endpoint Public API (bersama ApiKeyGuard).
 */
@Injectable()
export class ApiUsageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const apiKey = req.apiKey;
        if (apiKey?.id) {
          // fire-and-forget: log usage (import dinamis hindari circular dep)
          import("../../modules/api-keys/api-keys.service").then(({ ApiKeysService }) => {
            // gunakan service via app? sederhananya tulis via Prisma langsung di sini
          }).catch(() => undefined);
          // log langsung via Prisma (tanpa inject untuk menghindari siklus)
          void logUsage(apiKey.id, req.originalUrl ?? req.url, res.statusCode);
        }
      }),
    );
  }
}

async function logUsage(apiKeyId: string, endpoint: string, statusCode: number) {
  try {
    const { PrismaService } = await import("../../prisma/prisma.service");
    const prisma = new PrismaService();
    await prisma.apiKeyUsageLog.create({ data: { apiKeyId, endpoint, statusCode } });
    await prisma.$disconnect();
  } catch {
    // abaikan — logging tidak boleh memblokir respons
  }
}
