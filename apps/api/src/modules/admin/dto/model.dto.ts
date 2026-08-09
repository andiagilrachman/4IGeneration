import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateModelDto {
  @IsString()
  providerId: string;

  @IsString() @MaxLength(120)
  modelId: string;

  @IsString() @MaxLength(40)
  alias: string;

  @IsOptional() @IsInt() @Min(1)
  contextWindow?: number;

  @IsOptional() @IsNumber() @Min(0)
  priceInput?: number;

  @IsOptional() @IsNumber() @Min(0)
  priceOutput?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateModelDto extends CreateModelDto {}
