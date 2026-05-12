import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CrossAction } from './cross.entity';
import { CrossController } from './cross.controller';
import { CrossService } from './cross.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrossAction])],
  controllers: [CrossController],
  providers: [CrossService],
})
export class CrossModule {}
