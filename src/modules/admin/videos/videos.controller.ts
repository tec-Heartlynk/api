import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { VideosAdminService } from './videos.service';
import { UpdateAdminVideoDto } from './dto/update-video-status.dto';

@Controller('admin/user-video')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosAdminService) {}

  // ✅ Get All Videos
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  // ✅ Get Single User Video
  @Get('user/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findVideoByUserId(id);
  }

  // ✅ Update Video Verification Status
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,

    @Body()
    updateVideoDto: UpdateAdminVideoDto,
  ) {
    return this.videosService.updateVideoStatus(
      id,
      updateVideoDto.video_verified,
    );
  }
}
