import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { CrossService } from './cross.service';
import { CrossDto } from './dto/cross.dto';

@Controller('mobile/cross')
@UseGuards(JwtAuthGuard)
export class CrossController {
  constructor(private readonly crossService: CrossService) {}

  @Post()
  async create(@Req() req, @Body() dto: CrossDto) {
    return this.crossService.create(req.user.userId, dto);
  }
  @Get()
  async getcrossdetails(@Req() req) {
    return this.crossService.getcrossdetails(req.user.userId);
  }

  @Delete()
  async delete(@Req() req, @Param('id') to_user_id: number) {
    const userId = req.user.userId;

    return this.crossService.delete(userId, to_user_id);
  }
}
