import { IsJWT, IsString } from "class-validator";

export class LogoutDto {
  @IsString()
  @IsJWT({ message: "refreshToken harus berupa JWT" })
  refreshToken: string;
}
