import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';

import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { CreateUserPreferenceQuestionAnswerDto } from './dto/create-user-preference-question-answer.dto';
import { BulkUserPreferenceQuestionAnswerDto } from './dto/bulk-user-preference.dto';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { User } from '../users/user.entity';

@Controller('mobile/user-preference-question-answer')
@UseGuards(JwtAuthGuard) // 🔐 protect all routes
export class UserPreferenceQuestionAnswerController {
  constructor(private readonly service: UserPreferenceQuestionAnswerService) {}

  // ✅ CREATE (insert or update)
  @Post()
  create(@Req() req, @Body() dto: BulkUserPreferenceQuestionAnswerDto) {
    return this.service.create(req.user.userId, dto);
  }
  // // 📥 GET ALL
  // @Get()
  // findAll(@Req() req) {
  //   return this.service.findAll(req.user?.userId);
  // }

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
}
