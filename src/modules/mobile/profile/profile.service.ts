import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
//import { mapFileUrls } from '../../common/utility/file-url.util';
import { profile } from 'console';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    private configService: ConfigService,
  ) {}

  // Create profile for user
  async create(
    userId: number,
    dto: CreateProfileDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const existing = await this.profileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (existing) {
        throw new BadRequestException(
          'Profile already exists. Please update instead.',
        );
      }

      // ✅ MIN 1 IMAGE REQUIRED
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one profile image is required');
      }

      // 🔥 max already handled by multer (6)

      // ✅ validation
      if (!files || files.length === 0) {
        throw new BadRequestException('At least one profile image is required');
      }

      // ✅ ONLY filenames array (THIS IS CORRECT)
      const photos: string[] = files.map((file) => file.filename);

      const profile = this.profileRepo.create({
        ...dto,
        photos,
        user: { id: userId },
      });

      return await this.profileRepo.save(profile);
    } catch (error) {
      console.error('CREATE PROFILE ERROR 👉', error);

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Failed to create profile');
    }
  }

  //Get profile detail
  async findByUserIdprofile(userId: number) {
    try {
      const getprofiledata = await this.profileRepo
        .createQueryBuilder('profile')
        .leftJoinAndSelect('profile.user', 'user')
        .select([
          'profile',
          'user.id',
          'user.email',
          'user.role',
          'user.isActive',
        ])
        .where('user.id = :userId', { userId })
        .getOne();
      if (!getprofiledata) {
        throw new NotFoundException('Profile not found');
      }

      return getprofiledata;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  //Update profile

  async update(
    userId: number,
    dto: UpdateProfileDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const profile = await this.profileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // ❌ Empty update check
      const hasDtoData = Object.keys(dto).length > 0;
      const hasFiles = files && files.length > 0;

      if (!hasDtoData && !hasFiles) {
        throw new BadRequestException('No data provided for update');
      }

      // ❌ prevent overriding photos from DTO
      const { photos, ...safeDto } = dto as any;

      // 🔥 REPLACE MODE (old images removed, new only saved)
      if (hasFiles) {
        profile.photos = files.map((file) => file.filename);
      }

      // update other fields
      Object.assign(profile, safeDto);

      return await this.profileRepo.save(profile);
    } catch (error) {
      console.error('UPDATE PROFILE ERROR 👉', error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update profile');
    }
  }
}
