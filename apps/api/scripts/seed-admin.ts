/**
 * Seed user admin — jalankan: pnpm --filter @4ig/api seed:admin
 * Membuat/update user dengan role ADMIN (untuk akses Admin Panel).
 *
 * Env:
 *   ADMIN_EMAIL    (default: admin@4igeneration.com)
 *   ADMIN_PASSWORD (default: admin12345 — WAJIB ganti di production!)
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@4igeneration.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", status: "ACTIVE", passwordHash: hash },
    create: {
      email,
      passwordHash: hash,
      name: "Administrator",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Admin user siap:");
  console.log(`   email   : ${email}`);
  console.log(`   password: ${password}`);
  console.log(`   role    : ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
