import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

/**
 * Endpoint users — sesuai blueprint BAGIAN 8.2:
 * GET /users/profile · PUT /users/profile (keduanya butuh login)
 */
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  profile(@CurrentUser("id") userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put("profile")
  updateProfile(@CurrentUser("id") userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }
}
