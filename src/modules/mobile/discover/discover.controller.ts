import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  // ✅ ALL PROFILES WITH DISTANCE

  @UseGuards(JwtAuthGuard)
  @Get('profiles')
  getProfiles(
    @Req() req,
    @Query('minAge') minAge: number,
    @Query('maxAge') maxAge: number,
    @Query('maxDistance') maxDistance: number,
    @Query('interests') interests: string,
  ) {
    return this.discoverService.getAllProfilesWithDistance(
      req.user.userId,
      1,
      10,
      minAge,
      maxAge,
      maxDistance,
      interests,
    );
  }
}
