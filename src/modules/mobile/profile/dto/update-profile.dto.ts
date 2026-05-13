import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsDateString,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
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

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'Maximum 6 photos allowed' })
  photos?: string[];
}
