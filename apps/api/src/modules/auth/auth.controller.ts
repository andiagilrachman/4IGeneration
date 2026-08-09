import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: { email: string; password: string; name?: string }) {
    // TODO (Week 2): validasi Zod/class-validator + simpan user + hash password
    return this.authService.stubNotImplemented("register");
  }

  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    // TODO (Week 2): verifikasi kredensial + issue JWT
    return this.authService.stubNotImplemented("login");
  }

  @Get("me")
  me() {
    // TODO (Week 2): @UseGuards(JwtAuthGuard) + ambil user dari token
    return this.authService.stubNotImplemented("me");
  }
}
