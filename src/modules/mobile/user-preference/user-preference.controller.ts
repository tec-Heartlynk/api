import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { UpdateUserExtraPreferenceDto } from './dto/update-user-extar-preference.dto';
import { UpdateUserAboutPreferenceDto } from './dto/update-user-profile-preference.dto';
import { UpdateRelationGoalDto } from './dto/update-relation-goal.dto';
import { UpdateInterestsLifestyleDto } from './dto/update-intrests-lifestyle.dto';

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

  // ✅ Extra UPDATE
  @Patch('/update-extra-preferences/:id')
  updateExtra(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateUserExtraPreferenceDto,
  ) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error('User ID missing from JWT');
    }

    return this.service.updateExtraPreferences(id, user_id, dto);
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

  @Patch('update-about')
  updateAbout(@Req() req, @Body() dto: UpdateUserAboutPreferenceDto) {
    return this.service.updateAbout(req.user.userId, dto);
  }

  @Patch('update-relation-goals')
  updateRelationGoal(@Req() req, @Body() dto: UpdateRelationGoalDto) {
    return this.service.updateRelationGoal(req.user.userId, dto);
  }

  @Patch('update-interests-lifestyle')
  updateInterestsLifestyle(
    @Req() req,
    @Body() dto: UpdateInterestsLifestyleDto,
  ) {
    return this.service.updateInterestsLifestyle(req.user.userId, dto);
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
