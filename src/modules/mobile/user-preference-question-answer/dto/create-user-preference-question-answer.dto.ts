import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserPreferenceQuestionAnswerDto {
  @IsNotEmpty()
  @IsInt()
  q_id!: number;

  @IsNotEmpty()
  @IsInt()
  ans_id!: number;

  @IsNotEmpty()
  @IsString()
  cat_slug!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
