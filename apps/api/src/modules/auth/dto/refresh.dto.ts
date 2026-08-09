import { IsJWT, IsString } from "class-validator";

export class RefreshDto {
  @IsString()
  @IsJWT({ message: "refreshToken harus berupa JWT" })
  refreshToken: string;
}
