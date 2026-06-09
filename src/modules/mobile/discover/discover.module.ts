import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';

import { Profile } from '../profile/profile.entity';
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';
import { HeartAction } from '../heart/heart.entity';
import { StarAction } from '../star/star.entity';
import { CrossAction } from '../cross/cross.entity';
import { UserPreference } from '../user-preference/user-preference.entity';

import { DailyProfileView } from './daily-profile-view.entity';
import { UserTraitLedgerModule } from '../user_trait_ledger/user-trait-ledger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      CategoryQuestionOption,
      HeartAction,
      StarAction,
      CrossAction,
      UserPreference,
      DailyProfileView,
    ]),
    UserTraitLedgerModule,
  ],

  controllers: [DiscoverController],

  providers: [DiscoverService],
})
export class DiscoverModule {}
