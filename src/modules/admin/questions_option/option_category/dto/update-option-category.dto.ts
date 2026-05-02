import { PartialType } from '@nestjs/mapped-types';
import { CreateOptionCategoryDto } from './create-option-category.dto';

export class UpdateOptionCategoryDto extends PartialType(
  CreateOptionCategoryDto,
) {}
