import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StarAction } from './star.entity';
import { StarDto } from './dto/star.dto';

@Injectable()
export class StarService {
  constructor(
    @InjectRepository(StarAction)
    private readonly starRepo: Repository<StarAction>,
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

    return {
      success: true,
      message: 'Star action saved successfully',
      data: saved,
    };
  }

  // HISTORY
  async getstardetails(userId: number) {
    const data = await this.starRepo.find({
      where: {
        from_user_id: userId,
      },
      order: {
        id: 'DESC',
      },
    });

    return {
      success: true,
      data,
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
