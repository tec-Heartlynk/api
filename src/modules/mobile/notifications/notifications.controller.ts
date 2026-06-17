import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { SaveDeviceTokenDto } from './dto/save-device-token.dto';

import { ConfigService } from '@nestjs/config';
import { SendMessageNotificationDto } from './dto/send-message-notification.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // 🔐 ALL ROUTES PROTECTED
@Controller('mobile/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('save-device')
  async saveDevice(@Req() req, @Body() dto: SaveDeviceTokenDto) {
    // console.log(dto);

    return this.notificationsService.saveDevice(req.user.userId, dto);
  }

  @Get('my-notifications')
  async myNotifications(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ) {
    return this.notificationsService.getMyNotifications(
      req.user.userId,
      page,
      limit,
    );
  }

  @Post('send-message')
  async sendMessageNotification(
    @Req() req,
    @Body() dto: SendMessageNotificationDto,
  ) {
    const userId = req.user.userId;

    await this.notificationsService.sendChatNotification(
      userId, // sender
      dto.to_user_id, // receiver
      dto.title,
      dto.message,
      dto.image,
    );

    return {
      success: true,
      message: 'Message notification sent successfully',
    };
  }
}
