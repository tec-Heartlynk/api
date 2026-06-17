import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('mobile/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // 👤 GET LOGGED-IN USER PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.findByEmail(req.user.email);
  }

  @Delete('my-account-delete')
  async deleteAccount(@Req() req, @Body() dto: DeleteAccountDto) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.usersService.deleteAccount(req.user.userId, token, dto);
  }
}
