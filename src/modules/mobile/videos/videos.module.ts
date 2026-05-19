import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Videos } from './videos.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Videos]), UsersModule],

  controllers: [VideosController],

  providers: [VideosService],

  exports: [VideosService],
})
export class VideosModule {}
