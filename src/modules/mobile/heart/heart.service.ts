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

@Injectable()
export class HeartService {
  constructor(
    @InjectRepository(HeartAction)
    private readonly heartRepo: Repository<HeartAction>,
    private userService: UsersService,
    @InjectRepository(StarAction)
    private readonly starRepo: Repository<StarAction>,
    private readonly userTraitLedgerService: UserTraitLedgerService,
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

    return {
      success: true,
      message: 'Heart action saved successfully',
      data: saved,
    };
  }

  // HISTORY
  async getheartdetails(userId: number) {
    const data = await this.heartRepo
      .createQueryBuilder('heart')

      .leftJoin(
        'profiles', // table name
        'profile', // alias
        'profile.user_id = heart.to_user_id',
      )

      .select([
        'heart.id AS id',
        'heart.from_user_id AS from_user_id',
        'heart.to_user_id AS to_user_id',
        'profile.name AS profile_name',
        'profile.id AS profile_id',
      ])

      .where('heart.from_user_id = :userId', { userId })

      .orderBy('heart.id', 'DESC')

      .getRawMany();

    return {
      success: true,
      data,
    };
  }

  async getheartnewlikes(userId: number) {
    const baseUrl = process.env.BASE_URL;
    const uploadPath = process.env.UPLOAD_PATH;

    const data = await this.heartRepo
      .createQueryBuilder('heart')
      .leftJoin('profiles', 'profile', 'profile.user_id = heart.to_user_id')
      .leftJoin('user_photo', 'photo', 'photo.user_id = heart.to_user_id')
      .select([
        'heart.id AS id',
        'heart.from_user_id AS from_user_id',
        'heart.to_user_id AS to_user_id',
        'profile.id AS profile_id',
        'profile.name AS profile_name',
        'profile.dob AS dob',
      ])
      .addSelect(
        `CONCAT('${baseUrl}/${uploadPath}/profile/', photo.photo)`,
        'profile_photo',
      )
      .where('heart.from_user_id = :userId', { userId })
      .orderBy('heart.id', 'DESC')
      .getRawMany();

    const formattedData = await Promise.all(
      data.map(async (item) => {
        // User who liked current user
        const targetUserId = Number(item.to_user_id);

        // ✅ Age
        let age: number | null = null;
        if (item.dob) {
          age = calculateAge(item.dob);
        }

        // ✅ Star Check
        const starExists = await this.starRepo.findOne({
          where: {
            from_user_id: userId,
            to_user_id: targetUserId,
          },
        });

        // ✅ Compatibility Score
        const domainCompatibilityScores =
          await this.userTraitLedgerService.getDomainCompatibilityScores(
            userId,
            targetUserId,
          );

        const compatibilityScore = Number(
          domainCompatibilityScores.overallCompatibility.toFixed(2),
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
          compatibility_score: compatibilityScore,
        };
      }),
    );

    return {
      success: true,
      data: formattedData,
    };
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
