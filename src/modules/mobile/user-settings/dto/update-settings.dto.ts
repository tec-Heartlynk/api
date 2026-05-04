// src/modules/settings/dto/update-settings.dto.ts

import { IsBoolean, IsOptional } from 'class-validator';

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
}
