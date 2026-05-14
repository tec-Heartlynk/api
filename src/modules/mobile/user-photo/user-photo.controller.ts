import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Req,
  BadRequestException,
  ParseIntPipe,
  Put,
  Body,
} from '@nestjs/common';

import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { UserPhotoService } from './user-photo.service';

import { UpdateUserPhotoDto } from './dto/update-user-photo.dto';

import { UserPhoto } from './user-photo.entity';
import { Profile } from '../profile/profile.entity';

@Controller('mobile/user-photo')
export class UserPhotoController {
  constructor(private readonly service: UserPhotoService) {}

  // =========================
  // Upload Photos
  // =========================

  // =========================
  // Upload Photos
  // =========================

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('photo', 6, {
      storage: diskStorage({
        destination: './uploads/profile',

        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);

          callback(null, uniqueName);
        },
      }),

      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only jpg, jpeg, png and webp images are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 6,
      },
    }),
  )
  async create(
    @Req() req,

    @Body() body,

    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    // =========================
    // VALIDATION
    // =========================

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one photo is required');
    }

    const userId = req.user.userId;

    // =========================
    // EXISTING PHOTOS
    // =========================

    const existingPhotos = await this.service.findAll(userId);

    // =========================
    // MAX 6 VALIDATION
    // =========================

    const totalPhotos = existingPhotos.length + files.length;

    if (totalPhotos > 6) {
      throw new BadRequestException(
        `You already have ${existingPhotos.length} photos. Maximum 6 photos allowed.`,
      );
    }

    // =========================
    // DEBUG
    // =========================

    console.log(body);

    // =========================
    // SAVE NEW PHOTOS
    // =========================

    const uploadedPhotos: UserPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const photo = await this.service.create({
        user_id: userId,

        photo: file.filename,

        screen_status: Number(body.screen_status),

        // first image primary
        is_primary: existingPhotos.length === 0 && i === 0,
      });

      uploadedPhotos.push(photo);
    }

    // =========================
    // RESPONSE
    // =========================

    return {
      success: true,

      message: 'Photos uploaded successfully',

      total_photos: existingPhotos.length + uploadedPhotos.length,

      data: uploadedPhotos,
    };
  }

  // =========================
  // Get User Photos
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    // ✅ KEEP SAME JWT FIELD
    const userId = req.user.userId;

    const photos = await this.service.findAll(userId);

    return {
      success: true,
      data: photos,
    };
  }

  // =========================
  // Update Photo
  // =========================

  //Get Photos by User ID (for Profile)

  @UseGuards(JwtAuthGuard)
  @Put()
  @UseInterceptors(
    FilesInterceptor('photo', 6, {
      storage: diskStorage({
        destination: './uploads/profile',

        filename: (req, file, cb) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9) +
            extname(file.originalname);

          cb(null, uniqueName);
        },
      }),

      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only jpg, jpeg, png and webp images are allowed',
            ),
            false,
          );
        }

        cb(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 6,
      },
    }),
  )
  async replaceAllPhotos(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one photo is required');
    }

    const userId = req.user.userId;

    return this.service.replaceAllPhotos(userId, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    const photos = await this.service.findAll(userId);

    return {
      success: true,

      data: photos.map((item) => ({
        id: item.id,

        user_id: item.user_id,

        photo: `${process.env.BASE_URL}/uploads/profile/${item.photo}`,

        is_primary: item.is_primary,
      })),
    };
  }

  // =========================
  // Delete Photo
  // =========================

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Req() req,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    const userId = req.user.userId;

    return this.service.remove(id, userId);
  }
}
