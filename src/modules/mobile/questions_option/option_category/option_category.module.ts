import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionCategory } from './option_category.entity';
import { OptionCategoryService } from './option_category.service';
import { OptionCategoryController } from './option_category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OptionCategory])],
  controllers: [OptionCategoryController], // ✅ MUST
  providers: [OptionCategoryService],
})
export class OptionCategoryModule {}
