import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlockController } from './block.controller';
import { BlockService } from './block.service';

import { BlockUser } from './block.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockUser, User])],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
