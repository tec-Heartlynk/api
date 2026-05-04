import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from './user-preference.entity';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceController } from './user-preference.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference])],
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService],
})
export class UserPreferenceModule {}
