import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { UserPreferenceQuestionAnswerController } from './user-preference-question-answer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferenceQuestionAnswer])],
  controllers: [UserPreferenceQuestionAnswerController],
  providers: [UserPreferenceQuestionAnswerService],
})
export class UserPreferenceQuestionAnswerModule {}
