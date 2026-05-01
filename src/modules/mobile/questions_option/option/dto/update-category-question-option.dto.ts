import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryQuestionOptionDto } from './create-category-question-option.dto';

export class UpdateCategoryQuestionOptionDto extends PartialType(
  CreateCategoryQuestionOptionDto,
) {}
