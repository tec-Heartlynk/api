import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCategoryQuestionOptionDto {
  @IsNumber()
  option_category_id!: number;

  @IsString()
  @IsNotEmpty()
  option_title!: string;

  @IsOptional()
  @IsString()
  option_sub_title?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}
