import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';

import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { CreateUserPreferenceQuestionAnswerDto } from './dto/create-user-preference-question-answer.dto';
import { BulkUserPreferenceQuestionAnswerDto } from './dto/bulk-user-preference.dto';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { User } from '../users/user.entity';
import { CreateQuizDto } from '../quiz-question/dto/create-quiz.dto';

@Controller('mobile/user-preference-question-answer')
@UseGuards(JwtAuthGuard) // 🔐 protect all routes
export class UserPreferenceQuestionAnswerController {
  constructor(private readonly service: UserPreferenceQuestionAnswerService) {}

  // ✅ CREATE (insert or update)
  @Post()
  create(@Req() req, @Body() dto: BulkUserPreferenceQuestionAnswerDto) {
    return this.service.create(req.user.userId, dto);
  }
  // 📥 GET ALL
  @Get()
  // callLedger(@Req() req) {
  //   return this.service.callLedger(72);
  // }
   calculateCompatibilityScores(@Req() req) {
    return this.service.calculateCompatibilityScores(87,89);
  }
  

  // // 📥 GET ONE
  // @Get(':id')
  // findOne(@Req() req, @Param('id') id: number) {
  //   return this.service.findOne(+id, req.user?.userId);
  // }

  // // ❌ DELETE
  // @Delete(':id')
  // remove(@Req() req, @Param('id') id: number) {
  //   return this.service.remove(+id, req.user?.userId);
  // }

  @Patch('update-question-answer')
  async updateQuiz(
    @Req() req,
    @Body() dto: BulkUserPreferenceQuestionAnswerDto,
  ) {
    return this.service.updateQuizAnswers(req.user.userId, dto);
  }

  @Get('getall-save-preference-question-answer')
  async getMyAllAnswers(@Req() req, @Query('order') order: 'ASC' | 'DESC') {
    return this.service.getMyAllAnswers(req.user.userId, order || 'ASC');
  }

  @Get('category/:cat_slug')
  async getMyCategoryAnswers(
    @Req() req,
    @Param('cat_slug') cat_slug: string,
    @Query('order') order: 'ASC' | 'DESC',
  ) {
    return this.service.getMyCategoryAnswers(
      req.user.userId,
      cat_slug,
      order || 'ASC',
    );
  }
}
