import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

/**
 * Users module — GET/PUT profile (TODO lanjutan: password, email,
 * avatar upload, preferences, notifications — blueprint BAGIAN 8.2).
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
