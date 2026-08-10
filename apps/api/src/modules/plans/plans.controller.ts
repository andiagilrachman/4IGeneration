import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { PlansService } from "./plans.service";

/**
 * Endpoint plans — blueprint BAGIAN 8.4:
 * GET /plans          → daftar semua plan aktif (public)
 * GET /plans/:slug    → detail satu plan
 */
@Controller("plans")
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  list() {
    return this.plansService.list();
  }

  @Get(":slug")
  async detail(@Param("slug") slug: string) {
    const plan = await this.plansService.detail(slug);
    if (!plan) throw new NotFoundException("Plan tidak ditemukan");
    return plan;
  }
}
