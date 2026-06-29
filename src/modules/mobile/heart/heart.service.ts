import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { calculateAge } from '../../../common/function/common-function';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HeartAction } from './heart.entity';
import { HeartDto } from './dto/heart.dto';
import { UsersService } from '../users/users.service';
import { StarAction } from '../star/star.entity';
import { UserTraitLedgerService } from '../user_trait_ledger/user-trait-ledger.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfileService } from '../profile/profile.service';
import { profile } from 'console';

@Injectable()
export class HeartService {
  constructor(
    @InjectRepository(HeartAction)
    private readonly heartRepo: Repository<HeartAction>,
    private userService: UsersService,
    @InjectRepository(StarAction)
    private readonly starRepo: Repository<StarAction>,
    private readonly userTraitLedgerService: UserTraitLedgerService,
    private readonly notificationsService: NotificationsService,
    private readonly profileService: ProfileService,
  ) {}

  // CREATE HEART
  async create(userId: number, dto: HeartDto) {
    if (userId === dto.to_user_id) {
      throw new BadRequestException('You cannot heart yourself');
    }

    const existing = await this.userService.findById(dto.to_user_id);
    if (!existing) {
      throw new BadRequestException('User not found');
    }

    const alreadyExist = await this.heartRepo.findOne({
      where: {
        from_user_id: userId,
        to_user_id: dto.to_user_id,
      },
    });

    if (alreadyExist) {
      throw new BadRequestException('Heart already sent');
    }

    const data = this.heartRepo.create({
      from_user_id: userId,
      to_user_id: dto.to_user_id,
    });

    const saved = await this.heartRepo.save(data);

    if (saved?.id) {
      const sender = await this.profileService.findByUserIdprofile(userId);
      const receiver = await this.profileService.findByUserIdprofile(
        dto.to_user_id,
      );

      // Fetch sender details for notification
      const senderName = sender?.data?.name;
      const receiverName = receiver?.data?.name;

      const senderPhoto = sender?.data?.photos?.[0]?.photo
        ? sender?.data?.photos?.[0]?.photo
        : '';

      const receiverPhoto = receiver?.data?.photos?.[0]?.photo
        ? receiver?.data?.photos?.[0]?.photo
        : '';

      const mutualLike = await this.heartRepo.findOne({
        where: {
          from_user_id: dto.to_user_id,
          to_user_id: userId,
        },
      });

      if (mutualLike) {
        console.log("It's a match!");
        await this.notificationsService.sendNotification(
          userId,
          dto.to_user_id,
          'new_match',
          {
            name: senderName,
          },
          senderPhoto,
        );

        await this.notificationsService.sendNotification(
          dto.to_user_id,
          userId,
          'new_match',
          {
            name: receiverName,
          },
          receiverPhoto,
        );
      } else {
        await this.notificationsService.sendNotification(
          userId,
          dto.to_user_id,
          'new_match',
          {
            name: senderName,
          },
          senderPhoto,
        );
      }
    }

    return {
      success: true,
      message: 'Heart action saved successfully',
      data: saved,
    };
  }

  // HISTORY
  async getHeartDetails(userId: number) {
    try {
      const baseUrl = process.env.BASE_URL;
      const uploadPath = process.env.UPLOAD_PATH;

      const data = await this.heartRepo
        .createQueryBuilder('heart')
        .leftJoin('profiles', 'profile', 'profile.user_id = heart.to_user_id')
        .leftJoin(
          'user_photo',
          'photo',
          'photo.user_id = heart.to_user_id AND photo.is_primary = true',
        )
        .select([
          'heart.id AS id',
          'heart.from_user_id AS from_user_id',
          'heart.to_user_id AS to_user_id',
          'profile.id AS profile_id',
          'profile.name AS profile_name',
          'profile.dob AS dob',
        ])
        .addSelect(
          `CASE
          WHEN photo.photo IS NOT NULL
          THEN CONCAT('${baseUrl}/${uploadPath}/profile/', photo.photo)
          ELSE NULL
        END`,
          'profile_photo',
        )
        .where('heart.from_user_id = :userId', { userId })
        .orderBy('heart.id', 'DESC')
        .getRawMany();

      const result = await Promise.all(
        data.map(async (item) => {
          const scores =
            await this.userTraitLedgerService.getDomainCompatibilityScores(
              userId,
              item.to_user_id,
            );

          return {
            ...item,
            age: item.dob ? calculateAge(item.dob) : null,
            compatibility_score: Number(scores.overallCompatibility.toFixed(2)),
          };
        }),
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching heart details:', error);
      throw error;
    }
  }

  async getheartnewlikes(userId: number) {
    try {
      const baseUrl = process.env.BASE_URL;
      const uploadPath = process.env.UPLOAD_PATH;

      const data = await this.heartRepo
        .createQueryBuilder('heart')
        .leftJoin('profiles', 'profile', 'profile.user_id = heart.to_user_id')
        .leftJoin(
          'user_photo',
          'photo',
          'photo.user_id = heart.to_user_id AND photo.is_primary = true',
        )
        .select([
          'heart.id AS id',
          'heart.from_user_id AS from_user_id',
          'heart.to_user_id AS to_user_id',
          'profile.id AS profile_id',
          'profile.name AS profile_name',
          'profile.dob AS dob',
        ])
        .addSelect(
          `CASE
          WHEN photo.photo IS NOT NULL
          THEN CONCAT('${baseUrl}/${uploadPath}/profile/', photo.photo)
          ELSE NULL
        END`,
          'profile_photo',
        )
        .where('heart.from_user_id = :userId', { userId })
        .orderBy('heart.id', 'DESC')
        .getRawMany();

      const formattedData = await Promise.all(
        data.map(async (item) => {
          const targetUserId = Number(item.to_user_id);

          const age = item.dob ? calculateAge(item.dob) : null;

          const starExists = await this.starRepo.findOne({
            where: {
              from_user_id: userId,
              to_user_id: targetUserId,
            },
          });

          const domainCompatibilityScores =
            await this.userTraitLedgerService.getDomainCompatibilityScores(
              userId,
              targetUserId,
            );

          return {
            id: item.id,
            from_user_id: item.from_user_id,
            to_user_id: item.to_user_id,
            profile_id: item.profile_id,
            profile_name: item.profile_name,
            profile_photo: item.profile_photo,
            age,
            is_starred: !!starExists,
            compatibility_score: Number(
              domainCompatibilityScores.overallCompatibility.toFixed(2),
            ),
          };
        }),
      );

      return {
        success: true,
        data: formattedData,
      };
    } catch (error) {
      console.error('Error fetching heart new likes:', error);
      throw error;
    }
  }

  // DELETE HEART
  async delete(userId: number, to_user_id: number) {
    const heart = await this.heartRepo.findOne({
      where: {
        from_user_id: userId,
        to_user_id: to_user_id,
      },
    });

    if (!heart) {
      throw new NotFoundException('Heart action not found');
    }

    await this.heartRepo.remove(heart);

    return {
      success: true,
      message: 'Heart action deleted successfully',
    };
  }
}
