import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HeartAction } from './heart.entity';
import { HeartController } from './heart.controller';
import { HeartService } from './heart.service';

@Module({
  imports: [TypeOrmModule.forFeature([HeartAction])],
  controllers: [HeartController],
  providers: [HeartService],
})
export class HeartModule {}
