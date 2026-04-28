import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsDateString,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateProfileDto {
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
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'Maximum 6 photos allowed' })
  photos?: string[];
}
