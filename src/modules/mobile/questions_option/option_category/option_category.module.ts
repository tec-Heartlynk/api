import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionCategory } from './option_category.entity';
import { OptionModule } from '../option/option.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OptionCategory]),
    OptionModule, // ✅ relation ke liye
  ],
})
export class OptionCategoryModule {}
