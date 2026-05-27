import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { BlockService } from './block.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('admin/block')
@UseGuards(JwtAuthGuard)
export class AdminBlockController {
  constructor(private readonly blockService: BlockService) {}

  /*
  |--------------------------------------------------------------------------
  | GET ALL BLOCKS
  |--------------------------------------------------------------------------
  */

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.blockService.adminFindAll(Number(page), Number(limit));
  }

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE BLOCK
  |--------------------------------------------------------------------------
  */

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blockService.adminFindOne(id);
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE BLOCK
  |--------------------------------------------------------------------------
  */

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.blockService.adminRemove(id);
  }
}
