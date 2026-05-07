import { Type } from 'class-transformer';
import {
  IsInt,
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
