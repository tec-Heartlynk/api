import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryQuestionOption } from './category-question-option.entity';
import { CategoryQuestionOptionService } from './category-question-option.service';
import { CategoryQuestionOptionController } from './category-question-option.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryQuestionOption])],
  exports: [TypeOrmModule], // so other modules can use it
  controllers: [CategoryQuestionOptionController],
  providers: [CategoryQuestionOptionService],
})
export class OptionModule {}
