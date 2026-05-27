import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SuspensionService } from './suspension.service';

import { SuspendUserDto } from './dto/suspend-user.dto';
import { SendMessageDto } from './dto/send-message.dto';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/suspension')
export class SuspensionController {
  constructor(private readonly suspensionService: SuspensionService) {}

  /*
  |--------------------------------------------------------------------------
  | Suspend User
  |--------------------------------------------------------------------------
  */

  @Post('suspend')
  async suspendUser(@Body() dto: SuspendUserDto) {
    return this.suspensionService.suspendUser(dto);
  }

  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  @Post(':id/message')
  async sendMessage(
    @Param('id', ParseIntPipe)
    id: number,

    @Body() dto: SendMessageDto,
  ) {
    return this.suspensionService.sendMessage(id, dto);
  }

  /*
  |--------------------------------------------------------------------------
  | Get Chat
  |--------------------------------------------------------------------------
  */

  @Get(':id/chat')
  async getChat(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.suspensionService.getSuspensionChat(id);
  }

  /*
  |--------------------------------------------------------------------------
  | Check Current User Suspension
  |--------------------------------------------------------------------------
  */

  @Get('me/check')
  async checkSuspension(@Req() req) {
    return this.suspensionService.checkUserSuspension(req.user.userId);
  }

  /*
  |--------------------------------------------------------------------------
  | Get All User Suspension
  |--------------------------------------------------------------------------
  */

  @Get()
  async getAllSuspendedUsers() {
    return this.suspensionService.getAllSuspendedUsers();
  }
}
