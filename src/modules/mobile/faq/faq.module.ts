import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Faq } from '../../admin/faq/faq.entity';
import { FaqMobileController } from './faq.controller';
import { FaqmobileService } from './faq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqMobileController],
  providers: [FaqmobileService],
  exports: [FaqmobileService],
})
export class FaqmobileModule {}
