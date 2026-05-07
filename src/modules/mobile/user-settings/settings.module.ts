// src/modules/settings/settings.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSettings } from './settings.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings]), UsersModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
