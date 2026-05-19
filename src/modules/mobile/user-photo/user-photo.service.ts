import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserPhoto } from './user-photo.entity';

import { CreateUserPhotoDto } from './dto/create-user-photo.dto';

import { UsersService } from '../users/users.service';

import { Profile } from '../profile/profile.entity';

import * as fs from 'fs';

import * as path from 'path';

@Injectable()
export class UserPhotoService {
  constructor(
    @InjectRepository(UserPhoto)
    private photoRepo: Repository<UserPhoto>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    private userService: UsersService,
  ) {}

  // =========================
  // RESOLVE PROFILE
  // =========================

  private async resolveProfile(userOrProfileId: number): Promise<Profile> {
    try {
      const profile = await this.profileRepo.findOne({
        where: [{ id: userOrProfileId }, { user_id: userOrProfileId }],
      });

      if (!profile) {
        throw new NotFoundException('Profile not found for user');
      }

      if (!profile.user_id) {
        throw new InternalServerErrorException(
          'Profile user_id is missing for related profile',
        );
      }

      return profile;
    } catch (error) {
      throw error;
    }
  }

  // =========================
  // CREATE PHOTO
  // =========================

  async create(dto: CreateUserPhotoDto): Promise<UserPhoto> {
    try {
      const profile = await this.resolveProfile(dto.user_id);

      const profileId = profile.user_id;

      // =========================
      // COUNT EXISTING PHOTOS
      // =========================

      const totalPhotos = await this.photoRepo.count({
        where: {
          user_id: profileId,
        },
      });

      // =========================
      // MAX 6 VALIDATION
      // =========================

      if (totalPhotos >= 6) {
        throw new BadRequestException('Maximum 6 photos allowed');
      }

      // =========================
      // RESET OLD PRIMARY
      // =========================

      if (dto.is_primary) {
        await this.photoRepo.update(
          {
            user_id: profileId,
          },
          {
            is_primary: false,
          },
        );
      }

      // =========================
      // CREATE PHOTO
      // =========================

      const photo = this.photoRepo.create({
        user_id: profileId,

        photo: dto.photo,

        is_primary: totalPhotos === 0 ? true : dto.is_primary || false,
      });

      const savedPhoto = await this.photoRepo.save(photo);

      // =========================
      // UPDATE SCREEN STATUS
      // =========================

      if (totalPhotos === 0 && dto.screen_status !== undefined) {
        const userId = profile.user_id;

        if (userId === undefined) {
          throw new InternalServerErrorException(
            'Profile user_id is missing when updating screen status',
          );
        }

        await this.userService.updateStatus(
          userId,
          dto.screen_status,
        );
      }

      return savedPhoto;
    } catch (error) {
      console.log('CREATE PHOTO ERROR:', error);

      throw new InternalServerErrorException(
        error.message || 'Failed to create photo',
      );
    }
  }

  // =========================
  // GET ALL PHOTOS
  // =========================

  async findAll(user_id: number): Promise<UserPhoto[]> {
    try {
      const profile = await this.resolveProfile(user_id);

      const profileId = profile.user_id;

      return await this.photoRepo.find({
        where: {
          user_id: profileId,
        },

        order: {
          is_primary: 'DESC',
          id: 'DESC',
        },
      });
    } catch (error) {
      console.log('GET ALL PHOTOS ERROR:', error);

      throw new InternalServerErrorException(
        error.message || 'Failed to fetch photos',
      );
    }
  }

  // =========================
  // DELETE PHOTO
  // =========================

  async remove(id: number, userId: number) {
    try {
      // =========================
      // FIND PHOTO
      // =========================

      const profile = await this.resolveProfile(userId);

      const profileId = profile.user_id;

      const photo = await this.photoRepo.findOne({
        where: {
          id,
          user_id: profileId,
        },
      });

      if (!photo) {
        throw new NotFoundException('Photo not found');
      }

      // =========================
      // DELETE FILE FROM FOLDER
      // =========================

      const filePath = path.join(
        process.cwd(),
        'uploads',
        'profile',
        photo.photo,
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // =========================
      // DELETE DB RECORD
      // =========================

      await this.photoRepo.delete({
        id,
        user_id: profileId,
      });

      // =========================
      // CHECK REMAINING PHOTOS
      // =========================

      const remainingPhotos = await this.photoRepo.find({
        where: {
          user_id: profileId,
        },

        order: {
          id: 'ASC',
        },
      });

      // =========================
      // SET PRIMARY IF MISSING
      // =========================

      const hasPrimary = remainingPhotos.some(
        (item) => item.is_primary,
      );

      if (!hasPrimary && remainingPhotos.length > 0) {
        const firstPhoto = remainingPhotos[0];

        firstPhoto.is_primary = true;

        await this.photoRepo.save(firstPhoto);
      }

      return {
        success: true,
        message: 'Photo deleted successfully',
      };
    } catch (error) {
      console.log('DELETE PHOTO ERROR:', error);

      throw new InternalServerErrorException(
        error.message || 'Failed to delete photo',
      );
    }
  }
}