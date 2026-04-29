import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryQuestionOption } from './option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryQuestionOption])],
  exports: [TypeOrmModule], // so other modules can use it
})
export class OptionModule {}
