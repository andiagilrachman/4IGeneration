import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateProviderDto {
  @IsString() @MaxLength(60)
  slug: string;

  @IsString() @MaxLength(120)
  name: string;

  @IsString() @MaxLength(255)
  baseUrl: string;

  @IsOptional() @IsString() @MaxLength(40)
  authType?: string;

  @IsOptional() @IsInt() @Min(1)
  priority?: number;

  @IsOptional() @IsInt() @Min(0)
  weight?: number;

  @IsOptional() @IsInt() @Min(1000)
  timeoutMs?: number;

  @IsOptional() @IsInt() @Min(0)
  maxRetries?: number;

  @IsOptional() @IsString() @MaxLength(160)
  healthPath?: string;

  @IsOptional() config?: Record<string, unknown>;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateProviderDto extends CreateProviderDto {}
