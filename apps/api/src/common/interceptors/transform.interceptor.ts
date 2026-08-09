import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { randomUUID } from "crypto";
import { map, Observable } from "rxjs";

/**
 * TransformInterceptor — bungkus semua respons sukses ke format standar
 * blueprint BAGIAN 8:
 * { success: true, data, meta: { timestamp, request_id } }
 * Respons yang sudah punya key "success" dibiarkan apa adanya.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "success" in (data as Record<string, unknown>)) {
          return data;
        }
        return {
          success: true,
          data,
          meta: { timestamp: new Date().toISOString(), request_id: randomUUID() },
        };
      }),
    );
  }
}
