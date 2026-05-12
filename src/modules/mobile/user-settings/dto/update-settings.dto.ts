import { IsBoolean, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  age?: boolean;

  @IsOptional()
  @IsBoolean()
  distance?: boolean;

  @IsOptional()
  @IsBoolean()
  last_active?: boolean;

  @IsOptional()
  @IsBoolean()
  height?: boolean;

  @IsOptional()
  @IsBoolean()
  occupation?: boolean;

  @IsOptional()
  @IsBoolean()
  religion?: boolean;

  @IsOptional()
  @IsBoolean()
  ethnicity?: boolean;

  @IsOptional()
  @IsBoolean()
  education?: boolean;

  @IsOptional()
  @IsBoolean()
  languages?: boolean;

  @IsOptional()
  @IsBoolean()
  political_learning?: boolean;

  // ✅ IMPORTANT
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;

  // ✅ IMPORTANT
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  verified_status?: number;

  // ✅ IMPORTANT
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  match_status?: number;
}
