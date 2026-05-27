import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportUser } from '../../mobile/report-user/report-user.entity';
import { ReporAdmintUserController } from './report-user.controller';
import { ReportUserService } from './report-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportUser])],
  controllers: [ReporAdmintUserController],
  providers: [ReportUserService],
})
export class ReportAdminUserModule {}
