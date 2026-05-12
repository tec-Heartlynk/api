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
import { StarService } from './star.service';
import { StarDto } from './dto/star.dto';
@UseGuards(JwtAuthGuard)
@Controller('mobile/star')
export class StarController {
  constructor(private readonly starService: StarService) {}

  @Post()
  async create(@Req() req, @Body() dto: StarDto) {
    return this.starService.create(req.user.userId, dto);
  }

  @Get()
  async getstardetails(@Req() req) {
    return this.starService.getstardetails(req.user.userId);
  }
  @Delete()
  async delete(@Req() req, @Param('id') to_user_id: number) {
    const userId = req.user.userId;

    return this.starService.delete(userId, to_user_id);
  }
}
