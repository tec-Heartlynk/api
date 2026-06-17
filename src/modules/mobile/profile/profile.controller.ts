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
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/multer.config';

@Controller('mobile/profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // ✅ CREATE PROFILE WITH IMAGE UPLOAD
  @Post('create')
  @UseInterceptors(FilesInterceptor('photos', 6, multerConfig))
  createProfile(
    @Req() req,
    @Body() dto: CreateProfileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.profileService.create(req.user.userId, dto);
  }

  // ✅ GET PROFILE
  @Get('getprofile')
  getMyProfile(@Req() req) {
    return this.profileService.findByUserIdprofile(req.user.userId);
  }

  // ✅ GET PROFILE
  @Get('getprofile-status')
  getMyProfileStatus(@Req() req) {
    return this.profileService.findByUserIdprofileStatus(req.user.userId);
  }

  // ✅ GET PROFILE STATUS
  @Get('get-single-profile/:id')
  getSingleProfile(
    @Req() req,
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.profileService.findByUserIdprofile(id, req.user.userId);
  }

  // ✅ UPDATE PROFILE (without image)
  // @Patch('update-profile')
  // @UseInterceptors(FilesInterceptor('photos', 6, multerConfig))
  // updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
  //   return this.profileService.update(req.user.userId, dto);
  // }
}
