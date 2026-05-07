import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

export class CreateUserPreferenceDto {
  @IsNotEmpty()
  @IsNumber()
  looking_for?: number;

  @IsNotEmpty()
  @IsArray()
  interests?: number[];

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  feel!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
