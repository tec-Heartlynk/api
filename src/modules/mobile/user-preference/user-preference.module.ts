import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPreference } from './user-preference.entity';
import { Profile } from '../profile/profile.entity';

import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceController } from './user-preference.controller';
import { UsersModule } from '../users/users.module';

import { CrossModule } from '../cross/cross.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPreference, Profile]),
    UsersModule,
    CrossModule,
  ],
  providers: [UserPreferenceService],
  controllers: [UserPreferenceController],
  exports: [UserPreferenceService], // 🔥 MUST
})
export class UserPreferenceModule {}
