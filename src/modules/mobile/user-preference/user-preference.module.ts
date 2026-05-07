import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from './user-preference.entity';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceController } from './user-preference.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference]), UsersModule],
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService],

  // 👇 ADD THIS
  exports: [UserPreferenceService],
})
export class UserPreferenceModule {}
