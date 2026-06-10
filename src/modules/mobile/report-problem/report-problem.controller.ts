import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReportProblemService } from './report-problem.service';
import { CreateReportProblemDto } from './dto/create-report-problem.dto';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/report-problem')
@UseGuards(JwtAuthGuard)
export class ReportProblemController {
  constructor(private readonly reportProblemService: ReportProblemService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateReportProblemDto) {
    return this.reportProblemService.create(req.user.userId, dto);
  }
}
