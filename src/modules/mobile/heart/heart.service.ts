import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HeartAction } from './heart.entity';
import { HeartDto } from './dto/heart.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class HeartService {
  constructor(
    @InjectRepository(HeartAction)
    private readonly heartRepo: Repository<HeartAction>,
    private userService: UsersService,
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

      .where('heart.to_user_id = :userId', { userId })

      .orderBy('heart.id', 'DESC')

      .getRawMany();

    return {
      success: true,
      data,
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
