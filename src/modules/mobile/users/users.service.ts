import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, Role } from './user.entity';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserPhoto } from '../user-photo/user-photo.entity';

import { Profile } from '../profile/profile.entity';
import { UserSuspension } from '../../admin/suspension-user/suspension.entity';
import { Videos } from '../videos/videos.entity';
import { SuspensionMessage } from '../../admin/suspension-user/suspension-message.entity';
import { BlockUser } from '../../mobile/block-user/block.entity';
import { CrossAction } from '../cross/cross.entity';
import { DailyProfileView } from '../discover/daily-profile-view.entity';
import { HeartAction } from '../heart/heart.entity';
import { ReportProblem } from '../report-problem/report-problem.entity';
import { ReportUser } from '../report-user/report-user.entity';
import { StarAction } from '../star/star.entity';
import { UserDevice } from '../notifications/user-device.entity';
import { Notification } from '../notifications/notification.entity';
import { NotificationSetting } from '../notification-settings/notification-settings.entity';
import { UserPreference } from '../user-preference/user-preference.entity';
import { UserPreferenceQuestionAnswer } from '../user-preference-question-answer/user-preference-question-answer.entity';
import { UserSettings } from '../user-settings/settings.entity';
import { UserTraitLedger } from '../user_trait_ledger/user_trait_ledger.entity';
import { BlacklistService } from '../../blacklist/blacklist.service';
import { DeletedAccount } from './delete-account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private blacklistService: BlacklistService,
    private jwtService: JwtService,
    @InjectRepository(DeletedAccount)
    private deletedAccountRepo: Repository<DeletedAccount>,
    @InjectRepository(UserPhoto)
    private readonly userPhotoRepository: Repository<UserPhoto>,

    @InjectRepository(Videos)
    private readonly videoRepository: Repository<Videos>,
  ) {}

  // 🆕 CREATE USER (OTP FLOW)
  async createUser(email: string, screen_status: number) {
    try {
      email = email.toLowerCase().trim();

      // check existing user
      const existing = await this.userRepo.findOne({
        where: { email },
      });

      if (existing) {
        return existing; // already user exists, return same
      }

      const user = this.userRepo.create({
        email,
        role: Role.USER,
        isActive: true,
        isBlocked: false,
        status: screen_status,
      });

      return await this.userRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException('User creation failed');
    }
  }

  // 🔍 FIND USER
  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  // 🔍 FIND USER
  findById(id: number) {
    return this.userRepo.findOne({
      where: { id: id },
    });
  }

  async updateStatus(userId: number, status: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;

    return this.userRepo.save(user);
  }

  // 🗑️ DELETE ACCOUNT
  async deleteAccount(userId: number, token: string, dto: DeleteAccountDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get files before DB deletion
    const photos = await this.userPhotoRepository.find({
      where: { user_id: userId },
    });

    const videos = await this.videoRepository.find({
      where: { user_id: userId },
      select: {
        video_url: true,
      },
    });

    await this.dataSource.transaction(async (manager) => {
      // Save deleted account history
      await manager.save(DeletedAccount, {
        user_id: user.id,
        email: user.email,
        user_name: user.profile?.name || user.email.split('@')[0],

        reason: dto.reason,
        device_info: dto.device_info,
      });

      const suspensions = await manager.find(UserSuspension, {
        where: { user_id: userId },
        select: ['id'],
      });

      const suspensionIds = suspensions.map((item) => item.id);

      if (suspensionIds.length > 0) {
        await manager
          .createQueryBuilder()
          .delete()
          .from(SuspensionMessage)
          .where('suspension_id IN (:...ids)', {
            ids: suspensionIds,
          })
          .execute();
      }

      await manager
        .createQueryBuilder()
        .delete()
        .from(BlockUser)
        .where('user_id = :userId', { userId })
        .orWhere('blocked_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(CrossAction)
        .where('from_user_id = :userId', { userId })
        .orWhere('to_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(DailyProfileView)
        .where('user_id = :userId', { userId })
        .orWhere('profile_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(HeartAction)
        .where('from_user_id = :userId', { userId })
        .orWhere('to_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(ReportUser)
        .where('from_user_id = :userId', { userId })
        .orWhere('to_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(StarAction)
        .where('from_user_id = :userId', { userId })
        .orWhere('to_user_id = :userId', {
          userId,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .delete()
        .from(Notification)
        .where('user_id = :userId', { userId })
        .orWhere('from_user_id = :userId', {
          userId,
        })
        .execute();

      await manager.delete(Profile, {
        user_id: userId,
      });

      await manager.delete(ReportProblem, {
        user_id: userId,
      });

      await manager.delete(UserDevice, {
        user_id: userId,
      });

      await manager.delete(NotificationSetting, {
        user_id: userId,
      });

      await manager.delete(UserPhoto, {
        user_id: userId,
      });

      await manager.delete(UserPreference, {
        user_id: userId,
      });

      await manager.delete(UserPreferenceQuestionAnswer, {
        user_id: userId,
      });

      await manager.delete(UserSettings, {
        user_id: userId,
      });

      await manager.delete(UserTraitLedger, {
        user_id: userId,
      });

      await manager.delete(Videos, {
        user_id: userId,
      });

      await manager.delete(UserSuspension, {
        user_id: userId,
      });

      // Blacklist current token
      if (token) {
        const decoded: any = this.jwtService.decode(token);

        if (!decoded?.exp) {
          throw new BadRequestException('Invalid token');
        }

        await this.blacklistService.add(token, new Date(decoded.exp * 1000));
      }

      // Delete user last
      await manager.delete(User, {
        id: userId,
      });
    });

    // Delete files after successful transaction
    for (const photo of photos) {
      if (!photo.photo) continue;

      try {
        const filePath = path.join(process.cwd(), photo.photo);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Failed to delete photo:', error);
      }
    }

    for (const video of videos) {
      if (!video.video_url) continue;

      try {
        const filePath = path.join(process.cwd(), video.video_url);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Failed to delete video:', error);
      }
    }

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }
}
