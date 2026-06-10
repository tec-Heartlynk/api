import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  push_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  new_match?: boolean;

  @IsOptional()
  @IsBoolean()
  new_message?: boolean;

  @IsOptional()
  @IsBoolean()
  profile_like?: boolean;

  @IsOptional()
  @IsBoolean()
  super_like?: boolean;

  @IsOptional()
  @IsBoolean()
  daily_recommendation?: boolean;

  @IsOptional()
  @IsBoolean()
  verification_status?: boolean;

  @IsOptional()
  @IsBoolean()
  match_digest_email?: boolean;

  @IsOptional()
  @IsBoolean()
  product_updates_email?: boolean;
}
