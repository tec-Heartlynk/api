import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReportProblem } from './report-problem.entity';
import { CreateReportProblemDto } from './dto/create-report-problem.dto';

@Injectable()
export class ReportProblemService {
  constructor(
    @InjectRepository(ReportProblem)
    private readonly reportRepository: Repository<ReportProblem>,
  ) {}

  async create(userId: number, dto: CreateReportProblemDto) {
    const report = this.reportRepository.create({
      description: dto.description,
      user_id: userId,
    });

    const savedReport = await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Problem reported successfully.',
      data: savedReport,
    };
  }
}
