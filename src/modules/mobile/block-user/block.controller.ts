import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  Body,
} from '@nestjs/common';

import { BlockService } from './block.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/block')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  /*
  |--------------------------------------------------------------------------
  | BLOCK USER
  |--------------------------------------------------------------------------
  */

  @Post()
  async create(
    @Req() req,
    @Body('blocked_user_id', ParseIntPipe) blockedUserId: number,
  ) {
    const userId = req.user.userId;

    return this.blockService.create(userId, blockedUserId);
  }

  /*
  |--------------------------------------------------------------------------
  | MY BLOCK LIST
  |--------------------------------------------------------------------------
  */

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.userId;

    return this.blockService.findAll(userId);
  }

  /*
  |--------------------------------------------------------------------------
  | SINGLE BLOCK
  |--------------------------------------------------------------------------
  */

  @Get(':id')
  async findOne(@Req() req, @Param('id', ParseIntPipe) blockedUserId: number) {
    const userId = req.user.userId;

    return this.blockService.findOne(userId, blockedUserId);
  }

  /*
  |--------------------------------------------------------------------------
  | UNBLOCK USER
  |--------------------------------------------------------------------------
  */

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) blockedUserId: number) {
    const userId = req.user.userId;

    return this.blockService.remove(userId, blockedUserId);
  }
}
