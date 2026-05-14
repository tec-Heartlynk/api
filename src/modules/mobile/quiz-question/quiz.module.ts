import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { QuizOption } from '../../admin/quiz-question/quiz-option.entity';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestion, QuizOption])],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
