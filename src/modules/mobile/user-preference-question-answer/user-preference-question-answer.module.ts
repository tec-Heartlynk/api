import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { UserPreferenceQuestionAnswerController } from './user-preference-question-answer.controller';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPreferenceQuestionAnswer, QuizQuestion]),
    UsersModule,
  ],
  controllers: [UserPreferenceQuestionAnswerController],
  providers: [UserPreferenceQuestionAnswerService],
})
export class UserPreferenceQuestionAnswerModule {}
