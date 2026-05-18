import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

import { Profile } from '../profile/profile.entity';

// ✅ IMPORT ENTITY
import { CategoryQuestionOption } from '../questions_option/option/category-question-option.entity';

import { HeartAction } from '../heart/heart.entity';
import { StarAction } from '../star/star.entity';
import { CrossAction } from '../cross/cross.entity';
import { UserSettings } from '../user-settings/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      HeartAction,
      StarAction,
      CrossAction,

      // ✅ ADD THIS
      CategoryQuestionOption,
      UserSettings,
    ]),
  ],

  controllers: [DiscoverController],

  providers: [DiscoverService],
})
export class DiscoverModule {}
