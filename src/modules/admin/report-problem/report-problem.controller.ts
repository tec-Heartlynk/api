import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ReportProblemService } from './report-problem.service';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('admin/report-problem')
@UseGuards(JwtAuthGuard)
export class ReportProblemController {
  constructor(private readonly reportProblemService: ReportProblemService) {}

  @Get()
  async findAllReports(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reportProblemService.findAllReports(
      Number(page),
      Number(limit),
    );
  }

  @Get(':id/user-reports-problem')
  async myReports(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reportProblemService.findMyReports(
      id,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reportProblemService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportStatusDto: UpdateReportStatusDto,
  ) {
    return this.reportProblemService.updateStatus(
      id,
      updateReportStatusDto.status,
    );
  }
}
