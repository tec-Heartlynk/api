import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StarAction } from './star.entity';
import { StarController } from './star.controller';
import { StarService } from './star.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StarAction]),
    NotificationsModule,
    ProfileModule,
  ],
  controllers: [StarController],
  providers: [StarService],
})
export class StarModule {}
