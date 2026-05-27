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

      // reported user profile
      .leftJoin('users', 'user', 'user.id = report.to_user_id')

      .leftJoin('profiles', 'profile', 'profile.user_id = user.id')

      // category question option
      .leftJoin(
        'category_question_options',
        'option',
        'option.id = report.what_happened_id',
      )

      .select([
        'report.id as id',
        'report.to_user_id as to_user_id',
        'report.anything_else as anything_else',
        'report.describe as describe',

        // profile data
        'profile.name as profile_name',

        // what happened data
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
