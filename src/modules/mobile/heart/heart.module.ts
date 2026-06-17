import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HeartAction } from './heart.entity';
import { StarAction } from '../star/star.entity';
import { HeartController } from './heart.controller';
import { HeartService } from './heart.service';
import { UsersModule } from '../users/users.module';
import { UserTraitLedgerModule } from '../user_trait_ledger/user-trait-ledger.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HeartAction, StarAction]),
    UsersModule,
    UserTraitLedgerModule,
    NotificationsModule,
    ProfileModule,
  ],
  controllers: [HeartController],
  providers: [HeartService],
})
export class HeartModule {}
