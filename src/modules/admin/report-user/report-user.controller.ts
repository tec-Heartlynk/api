import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { ReportUserService } from './report-user.service';
import { UpdateAdminReportUserDto } from './dto/update-report-user.dto';

@Controller('admin/report-user')
export class ReporAdmintUserController {
  constructor(private readonly reportUserService: ReportUserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.reportUserService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportUserService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateAdminReportUserDto: UpdateAdminReportUserDto,
  ) {
    return this.reportUserService.update(id, UpdateAdminReportUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportUserService.remove(id);
  }
}
