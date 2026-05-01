import {
  Controller,
  Post,
  Get,
  Query,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { QuizCategory } from './quiz-category.enum';

@Controller('quiz-questions')
export class QuizController {
  constructor(private readonly service: QuizService) {}

  // 🔐 CREATE
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.service.create(dto);
  }

  // 🔓 READ ALL
  @Get()
  findAll(@Query('order') order: 'ASC' | 'DESC') {
    return this.service.findAll(order);
  }

  // 🔓 READ BY CATEGORY

  @Get('category/:category')
  findByCategory(
    @Param('category') category: QuizCategory,
    @Query('order') order: 'ASC' | 'DESC', // 👈 add this
  ) {
    return this.service.findByCategory(category, order);
  }

  // 🔓 READ SINGLE
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // 🔐 UPDATE
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateQuizDto) {
    return this.service.update(id, dto);
  }

  // 🔐 DELETE
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
