import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { CrossModule } from '../cross/cross.module'; // ✅ FIX
import { UserPhotoModule } from '../user-photo/user-photo.module';
import { UserTraitLedgerModule } from '../user_trait_ledger/user-trait-ledger.module'; // ✅ FIX

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, CategoryQuestionOption, QuizQuestion]),
    UsersModule,
    UserTraitLedgerModule,
    UserPhotoModule,
    CrossModule, // ✅ FIXED
  ],

  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
