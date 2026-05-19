import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('mobile/user-video')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads/videos',

        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),

      limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB
      },

      fileFilter: (req, file, callback) => {
        // ✅ iPhone + Android Supported Formats
        const allowedExtensions = ['.mp4', '.mov', '.m4v', '.3gp', '.webm'];

        const allowedMimeTypes = [
          'video/mp4',
          'video/quicktime',
          'video/x-m4v',
          'video/3gpp',
          'video/webm',
        ];

        const fileExtension = extname(file.originalname).toLowerCase();

        // ✅ Extension Validation
        if (!allowedExtensions.includes(fileExtension)) {
          return callback(
            new BadRequestException(
              'Only mp4, mov, m4v, 3gp, webm files are allowed',
            ),
            false,
          );
        }

        // ✅ MIME Validation
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Invalid video mime type'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() video: Express.Multer.File,
    @Body() createVideoDto: CreateVideoDto,
    @Req() req: any,
  ) {
    const user_id = req.user.userId;

    // ✅ File Required Validation
    if (!video) {
      throw new BadRequestException('Video file is required');
    }

    return this.videosService.create(createVideoDto, video, user_id);
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get('user/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findVideoByUserId(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.remove(id);
  }
}
