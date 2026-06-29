import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDiscoveryPreferenceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'min_age must be an integer' })
  @Min(18, { message: 'min_age must be at least 18' })
  @Max(120, { message: 'min_age cannot be greater than 100' })
  min_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'max_age must be an integer' })
  @Min(18, { message: 'max_age must be at least 18' })
  @Max(100, { message: 'max_age cannot be greater than 100' })
  max_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'max_distance must be an integer' })
  max_distance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'min_compatibility_scroe must be an integer' })
  min_compatibility_scroe?: number;

  @IsOptional()
  @IsString({ message: 'who_open_meeting must be a string' })
  who_open_meeting?: string;
}
