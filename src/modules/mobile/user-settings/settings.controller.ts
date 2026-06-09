import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/user-settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  // 👤 GET LOGGED-IN USER PROFILE
  @UseGuards(JwtAuthGuard)
  @Get()
  getSettings(@Req() req) {
    return this.service.getSettings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateSettings(@Req() req, @Body() dto: UpdateSettingsDto) {
    return this.service.updateSettings(req.user.userId, dto);
  }

  // profile-visibility
  @UseGuards(JwtAuthGuard)
  @Patch('profile-visibility')
  updateProfileVisibility(
    @Req() req,
    @Body('profile_visibility') profile_visibility: boolean,
  ) {
    return this.service.updateProfileVisibility(
      req.user.userId,
      profile_visibility,
    );
  }
}
