import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  // ✅ ALL PROFILES WITH DISTANCE
  @Get('profiles')
  @UseGuards(JwtAuthGuard)
  async getProfiles(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.discoverService.getAllProfilesWithDistance(
      req.user.userId,
      Number(page),
      Number(limit),
    );
  }
}
