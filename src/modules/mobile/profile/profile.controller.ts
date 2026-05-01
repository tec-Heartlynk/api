import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/multer.config';

@Controller('mobile/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ✅ CREATE PROFILE WITH IMAGE UPLOAD
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos', 6, multerConfig))
  createProfile(
    @Req() req,
    @Body() dto: CreateProfileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.profileService.create(req.user.userId, dto, files);
  }

  // ✅ GET PROFILE
  @Get('getprofile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req) {
    return this.profileService.findByUserIdprofile(req.user.userId);
  }

  // ✅ UPDATE PROFILE (without image)
  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('photos', 6, multerConfig))
  updateProfile(
    @Req() req,
    @Body() dto: UpdateProfileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.profileService.update(req.user.userId, dto, files);
  }
}
