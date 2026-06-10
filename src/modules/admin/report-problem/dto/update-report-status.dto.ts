import { IsEnum } from 'class-validator';

import { ReportProblemStatus } from '../../../mobile/report-problem/report-problem.entity';

export class UpdateReportStatusDto {
  @IsEnum(ReportProblemStatus)
  status!: ReportProblemStatus;
}
