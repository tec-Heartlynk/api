import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Videos } from '../../mobile/videos/videos.entity';

import { UsersService } from '../../mobile/users/users.service';

@Injectable()
export class VideosAdminService {
  constructor(
    @InjectRepository(Videos)
    private readonly videoRepo: Repository<Videos>,
    private readonly userService: UsersService,
  ) {}

  async findAll() {
    const videos = await this.videoRepo.find({
      relations: ['user', 'user.profile'], // ✅ relation load

      order: {
        id: 'DESC',
      },
    });

    return videos.map((video) => ({
      id: video.id,

      user_id: video.user_id,

      name: video.user?.profile?.name || null, // ✅ profile table

      email: video.user?.email || null, // ✅ users table

      video_url: `${process.env.BASE_URL}/uploads/videos/${video.video_url}`,

      video_verified: video.video_verified,
    }));
  }

  async findVideoByUserId(userId: number) {
    return await this.videoRepo.find({
      where: {
        user_id: userId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const video = await this.videoRepo.findOne({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async updateVideoStatus(id: number, video_verified: string) {
    // ✅ Allowed Status List
    const allowedStatuses = [
      'Pending Verification',
      'Verified',
      'Failed Verification',
      'Manual Review Required',
    ];

    // ✅ Validation
    if (!allowedStatuses.includes(video_verified)) {
      throw new BadRequestException('Invalid video verification status');
    }

    // ✅ Find by VIDEO ID
    const video = await this.videoRepo.findOne({
      where: {
        id,
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // ✅ Update status
    video.video_verified = video_verified;

    const updatedVideo = await this.videoRepo.save(video);

    return {
      success: true,
      data: {
        video_id: updatedVideo.id,
        user_id: updatedVideo.user_id,
        video_verified: updatedVideo.video_verified,
      },
      message: 'Video status updated successfully',
    };
  }
}
