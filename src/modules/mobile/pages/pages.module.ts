import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MobilePagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { Page } from '../../admin/pages/pages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  controllers: [MobilePagesController],
  providers: [PagesService],
})
export class PagesModule {}
