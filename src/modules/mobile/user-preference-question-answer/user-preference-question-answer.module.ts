import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { UserPreferenceQuestionAnswerService } from './user-preference-question-answer.service';
import { UserPreferenceQuestionAnswerController } from './user-preference-question-answer.controller';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { QuizOption } from '../../admin/quiz-question/quiz-option.entity';
import { UsersModule } from '../users/users.module';
import { UserTraitLedgerModule } from '../user_trait_ledger/user-trait-ledger.module';
import { CrossModule } from '../cross/cross.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferenceQuestionAnswer,
      QuizQuestion,
      QuizOption,
    ]),
    UsersModule,
    UserTraitLedgerModule,
    CrossModule,
  ],
  controllers: [UserPreferenceQuestionAnswerController],
  providers: [UserPreferenceQuestionAnswerService],
})
export class UserPreferenceQuestionAnswerModule {}
