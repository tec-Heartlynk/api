import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StarAction } from './star.entity';
import { StarDto } from './dto/star.dto';
import { calculateAge } from '../../../common/function/common-function';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class StarService {
  constructor(
    @InjectRepository(StarAction)
    private readonly starRepo: Repository<StarAction>,
    private readonly notificationsService: NotificationsService,
    private readonly profileService: ProfileService,
  ) {}

  async create(userId: number, dto: StarDto) {
    if (userId === dto.to_user_id) {
      throw new BadRequestException('You cannot star yourself');
    }

    const data = this.starRepo.create({
      from_user_id: userId,
      to_user_id: dto.to_user_id,
    });

    const saved = await this.starRepo.save(data);

    if (saved?.id) {
      const sender = await this.profileService.findByUserIdprofile(userId);

      // Fetch sender details for notification
      const senderName = sender?.data?.name;

      const senderPhoto = sender?.data?.photos?.[0]?.photo
        ? sender?.data?.photos?.[0]?.photo
        : '';

      await this.notificationsService.sendNotification(
        userId,
        dto.to_user_id,
        'send_star',
        {
          name: senderName,
        },
        senderPhoto,
      );
    }

    return {
      success: true,
      message: 'Star action saved successfully',
      data: saved,
    };
  }

  // HISTORY
  async getstardetails(userId: number) {
    const data = await this.starRepo
      .createQueryBuilder('star')

      .leftJoinAndSelect('star.toUser', 'toUser')

      .leftJoinAndSelect('toUser.profile', 'profile')

      .leftJoinAndSelect('toUser.photos', 'photos')

      .where('star.from_user_id = :userId', { userId })

      .orderBy('star.id', 'DESC')

      .getMany();

    const formattedData = data.map((item) => {
      const profile = item.toUser?.profile;

      // age calculate
      let age: number | null = null;

      if (profile?.dob) {
        age = calculateAge(profile.dob);
      }

      // profile photo
      const photo =
        item.toUser?.photos?.find((p) => p.is_primary === true)?.photo || null;

      // full image path
      const profile_photo = photo
        ? `${process.env.BASE_URL}/${process.env.UPLOAD_PATH}/profile/${photo}`
        : null;

      return {
        user_id: item.to_user_id,
        name: profile?.name || null,
        age,
        profile_photo,
        compatibility_score: '23',
        short_compatibility_insight: '50',
      };
    });

    return {
      success: true,
      data: formattedData,
    };
  }

  // DELETE STAR
  async delete(userId: number, to_user_id: number) {
    const star = await this.starRepo.findOne({
      where: {
        from_user_id: userId,
        to_user_id: to_user_id,
      },
    });

    if (!star) {
      throw new NotFoundException('Star action not found');
    }

    await this.starRepo.remove(star);

    return {
      success: true,
      message: 'Star action deleted successfully',
    };
  }
}
