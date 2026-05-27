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
import { CreateReportUserDto } from './dto/create-report-user.dto';
import { UpdateReportUserDto } from './dto/update-report-user.dto';

@Controller('mobile/report-user')
export class ReportUserController {
  constructor(private readonly reportUserService: ReportUserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() createReportUserDto: CreateReportUserDto) {
    const userId = req.user.userId;

    return this.reportUserService.create(userId, createReportUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-report-users')
  async findCurrentRerportUser(@Req() req) {
    const userId = req.user.userId;

    return this.reportUserService.findCurrentRerportUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportUserService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportUserService.remove(id);
  }
}
