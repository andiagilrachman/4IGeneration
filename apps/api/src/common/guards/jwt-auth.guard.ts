import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Guard JWT — wajib untuk route yang butuh login. */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
