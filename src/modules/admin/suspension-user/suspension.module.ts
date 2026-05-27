import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SuspensionController } from './suspension.controller';

import { SuspensionService } from './suspension.service';

import { SuspensionCron } from './suspension.cron';

import { UserSuspension } from './suspension.entity';

import { SuspensionMessage } from './suspension-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSuspension, SuspensionMessage])],

  controllers: [SuspensionController],

  providers: [SuspensionService, SuspensionCron],

  exports: [SuspensionService],
})
export class SuspensionAdminModule {}
