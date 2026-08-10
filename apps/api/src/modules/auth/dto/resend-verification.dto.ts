import { IsEmail } from "class-validator";

export class ResendVerificationDto {
  @IsEmail({}, { message: "Email tidak valid" })
  email: string;
}
