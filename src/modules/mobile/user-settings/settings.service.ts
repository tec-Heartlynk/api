// src/modules/settings/settings.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSettings } from './settings.entity';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UsersService } from '../users/users.service';
import { CrossService } from '../cross/cross.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private repo: Repository<UserSettings>,
    private userService: UsersService,
    private crossService: CrossService,
  ) {}

  async getSettings(user_id: number, dto?: UpdateSettingsDto) {
    let settings = await this.repo.findOne({
      where: { user_id },
    });

    if (!settings) {
      settings = this.repo.create({ user_id });

      await this.repo.save(settings);

      // ✅ dynamic status update
      if (dto?.screen_status !== undefined) {
        await this.userService.updateStatus(user_id, dto.screen_status);
      }
    }

    return settings;
  }

  async updateSettings(user_id: number, dto: UpdateSettingsDto) {
    const settings = await this.getSettings(user_id, dto);

    Object.assign(settings, dto);

    const updatedSettings = await this.repo.save(settings);
    await this.crossService.deleteByUserId(user_id);
    return updatedSettings;
  }
}
