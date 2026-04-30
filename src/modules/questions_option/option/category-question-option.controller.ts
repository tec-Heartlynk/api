import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CategoryQuestionOptionService } from './category-question-option.service';
import { CreateCategoryQuestionOptionDto } from './dto/create-category-question-option.dto';
import { UpdateCategoryQuestionOptionDto } from './dto/update-category-question-option.dto';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // 🔐 pura controller protected
@Controller('category-question-options')
export class CategoryQuestionOptionController {
  constructor(private readonly service: CategoryQuestionOptionService) {}

  @Post()
  create(@Body() dto: CreateCategoryQuestionOptionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryQuestionOptionDto,
  ) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
