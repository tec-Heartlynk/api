import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}