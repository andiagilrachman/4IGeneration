import { Controller, Get } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get("profile")
  profile() {
    // TODO (Week 2): @UseGuards(JwtAuthGuard) + ambil profil dari DB
    return {
      success: false,
      error: { code: "NOT_IMPLEMENTED", message: "Users module belum diimplementasikan." },
    };
  }
}
