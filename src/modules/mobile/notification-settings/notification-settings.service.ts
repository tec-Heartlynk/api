import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationSetting } from './notification-settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSetting)
    private readonly settingRepo: Repository<NotificationSetting>,
  ) {}

  async getSettings(userId: number) {
    let setting = await this.settingRepo.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!setting) {
      setting = await this.settingRepo.save({
        user_id: userId,
      });
    }

    return setting;
  }

  async updateSettings(userId: number, payload: Partial<NotificationSetting>) {
    let setting = await this.settingRepo.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!setting) {
      setting = await this.settingRepo.save({
        user_id: userId,
      });
    }

    Object.assign(setting, payload);

    return await this.settingRepo.save(setting);
  }
}
