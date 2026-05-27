import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminBlockController } from './block.controller';

import { BlockService } from './block.service';

import { BlockUser } from './block.entity';
import { User } from '../../mobile/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockUser, User])],

  controllers: [AdminBlockController],

  providers: [BlockService],

  exports: [BlockService],
})
export class BlockAdminModule {}
