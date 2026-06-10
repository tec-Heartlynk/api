import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { NotificationSettingsService } from './notification-settings.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(
    private readonly notificationService: NotificationSettingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getSettings(@Req() req) {
    return {
      success: true,
      data: await this.notificationService.getSettings(req.user.id),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateSettings(@Req() req, @Body() dto: UpdateNotificationDto) {
    return {
      success: true,
      message: 'Settings Updated',
      data: await this.notificationService.updateSettings(req.user.id, dto),
    };
  }
}
