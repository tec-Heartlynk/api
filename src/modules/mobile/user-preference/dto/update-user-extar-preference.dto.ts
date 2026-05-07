import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserExtraPreferenceDto {
  @IsNotEmpty()
  @IsNumber()
  height?: number;

  @IsNotEmpty()
  @IsNumber()
  occupation?: number;

  @IsNotEmpty()
  @IsNumber()
  religion?: number;

  @IsNotEmpty()
  @IsNumber()
  ethnicity?: number;

  @IsNotEmpty()
  @IsNumber()
  education?: number;

  @IsNotEmpty()
  @IsArray()
  language?: number[];

  @IsNotEmpty()
  @IsNumber()
  political_learning?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
