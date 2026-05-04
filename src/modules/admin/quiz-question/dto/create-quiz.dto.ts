import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

import { QuizCategory } from '../quiz-category.enum';
import { CreateQuizOptionDto } from './create-quiz-option.dto';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsEnum(QuizCategory)
  category!: QuizCategory;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  @ArrayMinSize(1) // minimum 1 option required
  options!: CreateQuizOptionDto[];
}
