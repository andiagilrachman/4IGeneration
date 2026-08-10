import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * PlansService — baca daftar plan (public).
 * CRUD plan dikelola admin via AdminService (blueprint BAGIAN 9).
 */
@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  detail(slug: string) {
    return this.prisma.plan.findUnique({ where: { slug } });
  }
}
