import { SetMetadata } from "@nestjs/common";

/** Deklarasi role yang boleh akses endpoint. */
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
