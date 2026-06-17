import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserDevice } from './user-device.entity';
import { Notification } from './notification.entity';
import { NotificationSetting } from '../notification-settings/notification-settings.entity';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from './firebase.service';
import { NotificationTemplateModule } from '../../admin/notification-template/notification-template.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDevice, Notification, NotificationSetting]),
    NotificationTemplateModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
