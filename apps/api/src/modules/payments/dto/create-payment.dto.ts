import { IsString, MaxLength } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  @MaxLength(60)
  planSlug: string;
}
