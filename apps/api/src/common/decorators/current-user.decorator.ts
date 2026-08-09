import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/** Ambil user yang sudah divalidasi oleh JwtAuthGuard (dari request.user). */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
