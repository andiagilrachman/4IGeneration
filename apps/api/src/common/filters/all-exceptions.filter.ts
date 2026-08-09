import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Response } from "express";

/**
 * AllExceptionsFilter — bungkus semua error ke format standar blueprint
 * BAGIAN 8:
 * { success: false, error: { code, message, details? }, meta: { timestamp, request_id } }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Terjadi kesalahan internal";
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        message = body;
      } else if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        code = (b.code as string) ?? (b.error as string)?.toUpperCase().replace(/\s+/g, "_") ?? "HTTP_ERROR";
        message = Array.isArray(b.message) ? b.message.join(", ") : ((b.message as string) ?? message);
        if (Array.isArray(b.message)) details = b.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${code} (${status}): ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error: { code, message, ...(details !== undefined ? { details } : {}) },
      meta: { timestamp: new Date().toISOString(), request_id: randomUUID() },
    });
  }
}
