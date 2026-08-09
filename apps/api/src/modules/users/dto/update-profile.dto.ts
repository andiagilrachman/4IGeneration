import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: "Nama maksimal 120 karakter" })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: "Nama lengkap maksimal 160 karakter" })
  fullName?: string;
}
