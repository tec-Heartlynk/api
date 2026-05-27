import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SuspensionService } from './suspension.service';
import { SuspensionController } from './suspension.controller';

import { UserSuspension } from '../../admin/suspension-user/suspension.entity';
import { SuspensionMessage } from '../../admin/suspension-user/suspension-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSuspension, SuspensionMessage])],

  controllers: [SuspensionController],

  providers: [SuspensionService],

  exports: [SuspensionService],
})
export class SuspensionModule {}
