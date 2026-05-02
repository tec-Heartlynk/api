import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // 👤 GET LOGGED-IN USER PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.findByEmail(req.user.email);
  }
}