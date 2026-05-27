import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminReportUserDto } from './create-report-user.dto';

export class UpdateAdminReportUserDto extends PartialType(
  CreateAdminReportUserDto,
) {}
