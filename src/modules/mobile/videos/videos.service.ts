import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Videos } from './videos.entity';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

import { UsersService } from '../users/users.service';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Videos)
    private readonly videoRepo: Repository<Videos>,
    private readonly userService: UsersService,
  ) {}

  async create(
    createVideoDto: CreateVideoDto,
    video: Express.Multer.File,
    user_id: number,
  ) {
    try {
      // =========================
      // VALIDATION
      // =========================
      if (!video) {
        throw new BadRequestException('Video file is required');
      }

      // =========================
      // SAVE VIDEO
      // =========================

      const saveVideo = this.videoRepo.create({
        user_id: user_id,

        video_verified: createVideoDto.video_verified ?? 'pending',

        video_url: video.filename,
      });

      const savedVideo = await this.videoRepo.save(saveVideo);

      // =========================
      // UPDATE SCREEN STATUS
      // =========================

      if (createVideoDto.screen_status != null) {
        await this.userService.updateStatus(
          user_id,
          createVideoDto.screen_status,
        );
      }

      return {
        success: true,
        message: 'Video uploaded successfully',
        data: {
          id: savedVideo.id,
          user_id: savedVideo.user_id,
          video_url: `${process.env.BASE_URL}/uploads/video/${savedVideo.video_url}`,
          video_verified: savedVideo.video_verified,
        },
      };
    } catch (error: unknown) {
      let message = 'Failed to upload video';

      if (error instanceof Error) {
        message = error.message;
      }

      console.log('VIDEO CREATE ERROR:', error);

      throw new InternalServerErrorException(message);
    }
  }

  async findAll() {
    return await this.videoRepo.find({
      order: {
        id: 'DESC',
      },
    });
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

  async update(id: number, updateVideoDto: UpdateVideoDto) {
    const video = await this.findOne(id);

    Object.assign(video, updateVideoDto);

    return await this.videoRepo.save(video);
  }

  async remove(id: number) {
    const video = await this.findOne(id);

    await this.videoRepo.remove(video);

    return {
      success: true,
      message: 'Video deleted successfully',
    };
  }
}
