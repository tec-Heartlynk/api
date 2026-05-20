import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HeartAction } from './heart.entity';
import { HeartController } from './heart.controller';
import { HeartService } from './heart.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([HeartAction]), UsersModule],
  controllers: [HeartController],
  providers: [HeartService],
})
export class HeartModule {}
