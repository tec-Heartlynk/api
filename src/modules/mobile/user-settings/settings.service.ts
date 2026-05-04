// src/modules/settings/settings.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSettings } from './settings.entity';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private repo: Repository<UserSettings>,
  ) {}

  async getSettings(user_id: number) {
    let settings = await this.repo.findOne({
      where: { user_id },
    });

    if (!settings) {
      // 🔥 IMPORTANT FIX
      settings = this.repo.create({
        user_id: user_id, // ✅ pass user_id
      });

      await this.repo.save(settings);
    }

    return settings;
  }

  async updateSettings(user_id: number, dto: UpdateSettingsDto) {
    const settings = await this.getSettings(user_id);

    Object.assign(settings, dto);

    return this.repo.save(settings);
  }
}
