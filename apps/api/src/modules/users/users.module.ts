import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";

/**
 * Users module — TODO (Week 2 roadmap):
 * - GET/PUT /users/profile
 * - PUT /users/password, PUT /users/email
 * - Notifications per user
 */
@Module({
  controllers: [UsersController],
})
export class UsersModule {}
