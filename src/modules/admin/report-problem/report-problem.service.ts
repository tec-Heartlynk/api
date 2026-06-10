import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ReportProblem,
  ReportProblemStatus,
} from '../../mobile/report-problem/report-problem.entity';

@Injectable()
export class ReportProblemService {
  constructor(
    @InjectRepository(ReportProblem)
    private readonly reportRepository: Repository<ReportProblem>,
  ) {}

  // Find All Reports (Admin)
  async findAllReports(page = 1, limit = 10) {
    const [reports, total] = await this.reportRepository.findAndCount({
      relations: {
        user: {
          profile: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: reports.map((report) => ({
        id: report.id,
        description: report.description,
        status: report.status,
        created_at: report.created_at,

        user: {
          id: report.user?.id,
          email: report.user?.email,
          name: report.user?.profile?.name,
        },
      })),

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findMyReports(userId: number, page = 1, limit = 10) {
    const [reports, total] = await this.reportRepository.findAndCount({
      where: {
        user_id: userId,
      },
      relations: {
        user: {
          profile: true,
        },
      },
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,

      data: reports.map((report) => ({
        id: report.id,
        description: report.description,
        status: report.status,
        created_at: report.created_at,

        user: {
          id: report.user?.id,
          email: report.user?.email,
          name: report.user?.profile?.name,
        },
      })),

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number, userId: number) {
    const report = await this.reportRepository.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return {
      success: true,
      data: report,
    };
  }

  // Update Report Status (Admin)

  async updateStatus(id: number, status: ReportProblemStatus) {
    const report = await this.reportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = status;

    await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Report status updated successfully',
      data: report,
    };
  }
}
