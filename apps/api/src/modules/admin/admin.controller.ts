import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";
import { CreateModelDto, UpdateModelDto } from "./dto/model.dto";
import { CreateProviderDto, UpdateProviderDto } from "./dto/provider.dto";
import {
  CreateProviderKeyDto,
  UpdateKeyStatusDto,
  UpdateProviderKeyDto,
} from "./dto/provider-key.dto";

/**
 * Admin endpoints — blueprint BAGIAN 8.10 + BAGIAN 9 (Admin Panel).
 * Semua route butuh JWT + role ADMIN/SUPER_ADMIN.
 */
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ---- DASHBOARD ----
  @Get("dashboard/stats")
  dashboardStats() {
    return this.adminService.dashboardStats();
  }

  // ---- PROVIDERS ----
  @Get("providers")
  listProviders() {
    return this.adminService.listProviders();
  }

  @Get("providers/:id")
  getProvider(@Param("id") id: string) {
    return this.adminService.getProvider(id);
  }

  @Post("providers")
  createProvider(@Body() dto: CreateProviderDto) {
    return this.adminService.createProvider(dto);
  }

  @Put("providers/:id")
  updateProvider(@Param("id") id: string, @Body() dto: UpdateProviderDto) {
    return this.adminService.updateProvider(id, dto);
  }

  @Delete("providers/:id")
  deleteProvider(@Param("id") id: string) {
    return this.adminService.deleteProvider(id);
  }

  // ---- PROVIDER KEYS ----
  @Get("provider-keys")
  listKeys(@Query("providerId") providerId?: string) {
    return this.adminService.listKeys(providerId);
  }

  @Post("provider-keys")
  createKey(@Body() dto: CreateProviderKeyDto) {
    return this.adminService.createKey(dto);
  }

  @Put("provider-keys/:id")
  updateKey(@Param("id") id: string, @Body() dto: UpdateProviderKeyDto) {
    return this.adminService.updateKey(id, dto);
  }

  @Put("provider-keys/:id/status")
  setKeyStatus(@Param("id") id: string, @Body() dto: UpdateKeyStatusDto) {
    return this.adminService.setKeyStatus(id, dto);
  }

  @Delete("provider-keys/:id")
  deleteKey(@Param("id") id: string) {
    return this.adminService.deleteKey(id);
  }

  // ---- MODELS ----
  @Get("models")
  listModels(@Query("providerId") providerId?: string) {
    return this.adminService.listModels(providerId);
  }

  @Post("models")
  createModel(@Body() dto: CreateModelDto) {
    return this.adminService.createModel(dto);
  }

  @Put("models/:id")
  updateModel(@Param("id") id: string, @Body() dto: UpdateModelDto) {
    return this.adminService.updateModel(id, dto);
  }

  @Delete("models/:id")
  deleteModel(@Param("id") id: string) {
    return this.adminService.deleteModel(id);
  }
}
