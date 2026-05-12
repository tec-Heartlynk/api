import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StarAction } from './star.entity';
import { StarController } from './star.controller';
import { StarService } from './star.service';

@Module({
  imports: [TypeOrmModule.forFeature([StarAction])],
  controllers: [StarController],
  providers: [StarService],
})
export class StarModule {}
