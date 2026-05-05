import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { UserPreferenceQuestionAnswerController } from './user-preference-question-answer.controller';

// 👇 ये missing है (add this)
import { QuizQuestion } from '../quiz-question/quiz-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferenceQuestionAnswer,
      QuizQuestion, // ✅ MUST ADD THIS
    ]),
  ],
  controllers: [UserPreferenceQuestionAnswerController],
  providers: [UserPreferenceQuestionAnswerService],
})
export class UserPreferenceQuestionAnswerModule {}
