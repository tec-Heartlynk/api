import { IsInt, IsString } from 'class-validator';

export class CreateUserPreferenceQuestionAnswerDto {
  @IsInt()
  q_id!: number;

  @IsInt()
  ans_id!: number;

  @IsString()
  cat_slug!: string;
}
