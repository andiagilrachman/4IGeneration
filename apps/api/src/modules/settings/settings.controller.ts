import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { SettingsService } from "./settings.service";

class SetSettingDto {
  @IsString()
  key: string;

  @IsDefined()
  value: unknown;

  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;
}

/**
 * Endpoint settings — blueprint BAGIAN 9 (⚙ SETTINGS) + BAGIAN 8.10.
 * Hanya ADMIN/SUPER_ADMIN. Semua konfigurasi tersimpan di DB (no hardcode).
 *
 * GET    /admin/settings                 → semua setting (secret disembunyikan)
 * GET    /admin/settings/:category       → setting per kategori
 * POST   /admin/settings/:category       → upsert setting {key, value, isSecret?}
 * DELETE /admin/settings/:category/:key  → hapus setting
 */
@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list() {
    return this.settingsService.list();
  }

  @Get(":category")
  listByCategory(@Param("category") category: string) {
    return this.settingsService.listByCategory(category);
  }

  @Post(":category")
  set(@Param("category") category: string, @Body() dto: SetSettingDto) {
    return this.settingsService.set(category, dto.key, dto.value, dto.isSecret);
  }

  @Delete(":category/:key")
  remove(@Param("category") category: string, @Param("key") key: string) {
    return this.settingsService.remove(category, key);
  }
}
