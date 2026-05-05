import { IsString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

// 👇 item DTO (NO cat_slug here)
class ItemDto {
  @Type(() => Number)
  @IsInt()
  q_id!: number;

  @Type(() => Number)
  @IsInt()
  ans_id!: number;
}

// 👇 main DTO
export class BulkUserPreferenceQuestionAnswerDto {
  @IsString()
  cat_slug!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  data!: ItemDto[];
}
