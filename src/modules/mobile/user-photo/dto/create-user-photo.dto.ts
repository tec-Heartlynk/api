import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserPhotoDto {
  @IsNotEmpty()
  @IsNumber()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  photo!: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
