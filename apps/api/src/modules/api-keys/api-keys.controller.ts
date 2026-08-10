import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsString, MaxLength, MinLength } from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiKeysService } from "./api-keys.service";

class CreateKeyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name: string;
}

/**
 * Endpoint API keys — blueprint BAGIAN 8.3 (🔒 login):
 * GET    /api-keys           → daftar key user
 * POST   /api-keys           → buat key baru (plain key tampil sekali)
 * DELETE /api-keys/:id       → cabut (revoke) key
 * GET    /api-keys/:id/usage → statistik penggunaan
 */
@Controller("api-keys")
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  list(@CurrentUser("id") userId: string) {
    return this.apiKeysService.list(userId);
  }

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateKeyDto) {
    return this.apiKeysService.create(userId, dto.name);
  }

  @Delete(":id")
  revoke(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.apiKeysService.revoke(userId, id);
  }

  @Get(":id/usage")
  usage(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.apiKeysService.usage(userId, id);
  }
}
