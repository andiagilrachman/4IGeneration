import { IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @MaxLength(72, { message: "Password maksimal 72 karakter" })
  password: string;
}
