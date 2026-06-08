import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReportUser } from '../../mobile/report-user/report-user.entity';
import { UpdateAdminReportUserDto } from './dto/update-report-user.dto';

@Injectable()
export class ReportUserService {
  constructor(
    @InjectRepository(ReportUser)
    private readonly reportUserRepo: Repository<ReportUser>,
  ) {}

  async findAll() {
    const reports = await this.reportUserRepo
      .createQueryBuilder('report')

      // Reported User
      .leftJoin('users', 'toUser', 'toUser.id = report.to_user_id')
      .leftJoin('profiles', 'toProfile', 'toProfile.user_id = toUser.id')

      // Report Created By User
      .leftJoin('users', 'fromUser', 'fromUser.id = report.from_user_id')
      .leftJoin('profiles', 'fromProfile', 'fromProfile.user_id = fromUser.id')

      // Category Option
      .leftJoin(
        'category_question_options',
        'option',
        'option.id = report.what_happened_id',
      )

      .select([
        'report.id as id',
        'report.from_user_id as from_user_id',
        'report.to_user_id as to_user_id',
        'report.anything_else as anything_else',
        'report.describe as describe',

        // Reported User Name
        'toProfile.name as reported_user_name',

        // Reported By User Name
        'fromProfile.name as reported_by_name',

        // What Happened
        'option.id as what_happened_id',
        'option.option_title as what_happened_name',
      ])

      .orderBy('report.id', 'DESC')
      .getRawMany();

    return reports;
  }

  async findOne(id: number) {
    const report = await this.reportUserRepo.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(id: number, UpdateAdminReportUserDto: UpdateAdminReportUserDto) {
    const report = await this.findOne(id);

    Object.assign(report, UpdateAdminReportUserDto);

    return await this.reportUserRepo.save(report);
  }

  async remove(id: number) {
    const report = await this.findOne(id);

    await this.reportUserRepo.remove(report);

    return {
      message: 'Report deleted successfully',
    };
  }
}
