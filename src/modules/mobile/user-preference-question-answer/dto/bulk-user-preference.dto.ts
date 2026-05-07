import {
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// item DTO
class ItemDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  q_id!: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  ans_id!: number;
}

// main DTO
export class BulkUserPreferenceQuestionAnswerDto {
  @IsString()
  @IsNotEmpty()
  cat_slug!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  data!: ItemDto[];
}
