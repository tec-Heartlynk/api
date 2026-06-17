import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserDevice } from './user-device.entity';
import { Notification } from './notification.entity';
import { NotificationSetting } from '../notification-settings/notification-settings.entity';

import { FirebaseService } from './firebase.service';
import { SaveDeviceTokenDto } from './dto/save-device-token.dto';
import { NotificationTemplateService } from '../../admin/notification-template/notification-template.service';
import { number } from 'joi';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserDevice)
    private deviceRepo: Repository<UserDevice>,

    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(NotificationSetting)
    private settingsRepo: Repository<NotificationSetting>,

    private notificationTemplateService: NotificationTemplateService,

    private firebaseService: FirebaseService,
  ) {}

  async saveDevice(userId: number, dto: SaveDeviceTokenDto) {
    const existing = await this.deviceRepo.findOne({
      where: {
        user_id: userId,
        device_id: dto.device_id,
      },
    });

    if (existing) {
      await this.deviceRepo.update(existing.id, {
        firebase_token: dto.firebase_token,
        is_active: true,
      });

      return {
        success: true,
      };
    }

    await this.deviceRepo.save({
      user_id: userId,
      device_type: dto.device_type,
      device_id: dto.device_id,
      firebase_token: dto.firebase_token,
    });

    return {
      success: true,
    };
  }

  async sendNotification(
    userId: number, // sender
    toUserId: number, // receiver
    type: string,
    variables: Record<string, any> = {},
    image?: string,
  ) {
    try {
      // Receiver notification settings
      const settings = await this.settingsRepo.findOne({
        where: { user_id: toUserId },
      });

      if (!settings) {
        console.log('❌ Notification settings not found');
        return;
      }

      if (!settings.push_enabled) {
        console.log('❌ Push notification disabled');
        return;
      }

      if (!settings?.[type]) {
        console.log(`❌ ${type} notification disabled`);
        return;
      }

      // Receiver devices
      const devices = await this.deviceRepo.find({
        where: {
          user_id: toUserId,
          is_active: true,
        },
      });

      const tokens = devices
        .map((device) => device.firebase_token)
        .filter(Boolean);

      if (!tokens.length) {
        console.log('❌ No Firebase Tokens Found');
        return;
      }

      // Template
      const template = await this.notificationTemplateService.getByType(type);

      if (!template) {
        throw new NotFoundException(
          `Notification template not found for type: ${type}`,
        );
      }

      let title = template.title;
      let message = template.message;

      // Replace variables
      for (const key in variables) {
        const value = String(variables[key] ?? '');

        const regex = new RegExp(`{${key}}`, 'g');

        title = title.replace(regex, value);
        message = message.replace(regex, value);
      }

      // Firebase Push
      const result = await this.firebaseService.sendToMany(
        tokens,
        title,
        message,
        image,
      );

      result.responses?.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`❌ Notification Failed: ${tokens[index]}`);
          console.error('Error Code:', (resp.error as any)?.code);
          console.error('Error Message:', (resp.error as any)?.message);
        }
      });

      // Save notification in DB
      await this.notificationRepo.save({
        user_id: toUserId, // receiver
        from_user_id: userId, // sender
        type,
        title,
        message,
      });

      return {
        success: true,
        title,
        message,
      };
    } catch (error) {
      console.error('🔥 SEND NOTIFICATION ERROR', error);

      throw error;
    }
  }

  async sendChatNotification(
    userId: number, // sender
    toUserId: number, // receiver
    title: string,
    message: string,
    image?: string,
  ) {
    try {
      const settings = await this.settingsRepo.findOne({
        where: { user_id: toUserId },
      });

      if (!settings?.push_enabled) {
        return;
      }

      if (!settings?.new_message) {
        return;
      }

      const devices = await this.deviceRepo.find({
        where: {
          user_id: toUserId,
          is_active: true,
        },
      });

      const tokens = devices
        .map((device) => device.firebase_token)
        .filter(Boolean);

      if (!tokens.length) {
        return;
      }

      await this.firebaseService.sendToMany(tokens, title, message, image);

      await this.notificationRepo.save({
        user_id: toUserId,
        from_user_id: userId,
        type: 'new_message',
        title,
        message,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('🔥 CHAT NOTIFICATION ERROR', error);
      throw error;
    }
  }

  async getMyNotifications(userId: number, page: number, limit: number) {
    const baseUrl = process.env.BASE_URL;
    const uploadPath = process.env.UPLOAD_PATH;

    const query = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoin(
        'profiles',
        'profile',
        'profile.user_id = notification.from_user_id',
      )
      .leftJoin(
        'user_photo',
        'photo',
        `photo.user_id = notification.from_user_id
   AND photo.is_primary = true`,
      )
      .select([
        'notification.id as id',
        'notification.title as title',
        'notification.message as message',
        'notification.type as type',
        'notification.is_read as is_read',
        'notification.created_at as created_at',
        'profile.name as profile_name',
      ])
      .addSelect(
        `CONCAT('${baseUrl}/${uploadPath}/profile/', photo.photo)`,
        'profile_image',
      )
      .where('notification.from_user_id = :userId', { userId });

    const skip = (page - 1) * limit;

    const total = await query.clone().getCount();

    const data = await query
      .clone()
      .orderBy('notification.created_at', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }
}
