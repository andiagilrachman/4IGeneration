import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Email tidak valid" })
  email: string;

  @IsString()
  @MinLength(8, { message: "Password minimal 8 karakter" })
  @MaxLength(72, { message: "Password maksimal 72 karakter" })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: "Nama maksimal 120 karakter" })
  name?: string;
}
