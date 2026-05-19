import {
  Controller,
  UseGuards,
  Req,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Param,
  Body,
  Patch,
} from '@nestjs/common';

import { ProfileAdminService } from './profile.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('admin/profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileAdminService: ProfileAdminService) {}

  // ✅ GET PROFILE WITH DYNAMIC PAGINATION
  @Get('')
  getMyProfile(
    @Req() req,

    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ) {
    return this.profileAdminService.getAllProfiles(page, limit);
  }

  // ✅ GET PROFILE STATUS
  @Get('get-single-profile/:id')
  getSingleProfile(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.profileAdminService.findByUserIdprofile(id);
  }

  @Patch('update-user-status/:id')
  updateUserStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('isActive')
    isActive: boolean,
  ) {
    return this.profileAdminService.updateUserStatus(id, isActive);
  }
}
