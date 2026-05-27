import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportUser } from './report-user.entity';
import { ReportUserController } from './report-user.controller';
import { ReportUserService } from './report-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportUser])],
  controllers: [ReportUserController],
  providers: [ReportUserService],
})
export class ReportUserModule {}
