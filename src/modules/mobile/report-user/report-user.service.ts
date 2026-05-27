import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReportUser } from './report-user.entity';
import { CreateReportUserDto } from './dto/create-report-user.dto';
import { UpdateReportUserDto } from './dto/update-report-user.dto';

@Injectable()
export class ReportUserService {
  constructor(
    @InjectRepository(ReportUser)
    private readonly reportUserRepo: Repository<ReportUser>,
  ) {}

  async create(userId: number, createReportUserDto: CreateReportUserDto) {
    const report = this.reportUserRepo.create({
      from_user_id: userId,
      ...createReportUserDto,
    });

    return await this.reportUserRepo.save(report);
  }

  async findCurrentRerportUser(userId: number) {
    const reports = await this.reportUserRepo.find({
      where: {
        from_user_id: userId,
      },
      order: {
        id: 'DESC',
      },
    });

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

  async update(id: number, updateReportUserDto: UpdateReportUserDto) {
    const report = await this.findOne(id);

    Object.assign(report, updateReportUserDto);

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
