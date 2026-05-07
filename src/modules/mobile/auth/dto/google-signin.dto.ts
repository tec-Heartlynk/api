import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleSignInDto {
  @IsString()
  @IsOptional()
  idToken?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
