import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserAboutPreferenceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  identity?: string;

  @IsOptional()
  @IsString()
  self_describe?: string;

  @IsOptional()
  @IsString()
  who_open_meeting?: string;

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

  @IsNotEmpty()
  @IsNumber()
  open_to_children?: number;

  @IsNotEmpty()
  @IsNumber()
  pets?: number;

  @IsNotEmpty()
  @IsNumber()
  drinking?: number;

  @IsNotEmpty()
  @IsNumber()
  smoking?: number;

  @IsNotEmpty()
  @IsNumber()
  diet?: number;
}
