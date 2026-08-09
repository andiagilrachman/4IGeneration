import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateProviderKeyDto {
  @IsString()
  providerId: string;

  @IsOptional() @IsString() @MaxLength(80)
  label?: string;

  @IsString() @MaxLength(1000)
  encryptedKey: string; // TODO (fase lanjut): enkripsi AES-256 sebelum simpan

  @IsOptional() @IsString() @MaxLength(20)
  status?: "ACTIVE" | "COOLING_DOWN" | "RATE_LIMITED" | "DISABLED" | "DEAD";

  @IsOptional() @IsInt() @Min(0)
  dailyLimit?: number;

  @IsOptional() @IsInt() @Min(0)
  monthlyLimit?: number;
}

export class UpdateProviderKeyDto {
  @IsOptional() @IsString() @MaxLength(80)
  label?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  encryptedKey?: string;

  @IsOptional() @IsString() @MaxLength(20)
  status?: "ACTIVE" | "COOLING_DOWN" | "RATE_LIMITED" | "DISABLED" | "DEAD";

  @IsOptional() @IsInt() @Min(0)
  dailyLimit?: number;

  @IsOptional() @IsInt() @Min(0)
  monthlyLimit?: number;
}

export class UpdateKeyStatusDto {
  @IsString()
  status: "ACTIVE" | "COOLING_DOWN" | "RATE_LIMITED" | "DISABLED" | "DEAD";
}
