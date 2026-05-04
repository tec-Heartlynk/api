import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/user-preferences')
@UseGuards(JwtAuthGuard)
export class UserPreferenceController {
  constructor(private readonly service: UserPreferenceService) {}

  // ✅ CREATE or UPDATE
  @Post()
  create(@Req() req, @Body() dto: CreateUserPreferenceDto) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error('User ID missing from JWT');
    }

    return this.service.create(user_id, dto);
  }

  // ✅ Get logged-in user preferences
  @Get()
  findMy(@Req() req) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error('User ID missing from JWT');
    }

    return this.service.findByUser(user_id);
  }

  // ✅ Update own preferences
  @Patch()
  update(@Req() req, @Body() dto: UpdateUserPreferenceDto) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error('User ID missing from JWT');
    }

    return this.service.update(user_id, dto);
  }

  // ✅ Delete own preferences
  @Delete()
  remove(@Req() req) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error('User ID missing from JWT');
    }

    return this.service.remove(user_id);
  }
}
