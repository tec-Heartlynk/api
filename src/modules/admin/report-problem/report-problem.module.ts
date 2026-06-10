import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportProblem } from '../../mobile/report-problem/report-problem.entity';

import { ReportProblemController } from './report-problem.controller';
import { ReportProblemService } from './report-problem.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportProblem])],
  controllers: [ReportProblemController],
  providers: [ReportProblemService],
  exports: [ReportProblemService],
})
export class ReportAdminProblemModule {}
