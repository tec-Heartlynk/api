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

import { HeartService } from './heart.service';
import { HeartDto } from './dto/heart.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // 🔐 ALL ROUTES PROTECTED
@Controller('mobile/heart')
export class HeartController {
  constructor(private readonly heartService: HeartService) {}

  @Post()
  async create(@Req() req, @Body() dto: HeartDto) {
    return this.heartService.create(req.user.userId, dto);
  }

  @Get()
  async getheartdetails(@Req() req) {
    return this.heartService.getheartdetails(req.user.userId);
  }

  @Get('new-likes')
  async getheartnewlikes(@Req() req) {
    return this.heartService.getheartnewlikes(req.user.userId);
  }

  @Delete()
  async delete(@Req() req, @Param('id') to_user_id: number) {
    const userId = req.user.userId;

    return this.heartService.delete(userId, to_user_id);
  }
}
