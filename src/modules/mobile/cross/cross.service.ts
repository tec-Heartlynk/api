import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CrossAction } from './cross.entity';
import { CrossDto } from './dto/cross.dto';

@Injectable()
export class CrossService {
  constructor(
    @InjectRepository(CrossAction)
    private readonly crossRepo: Repository<CrossAction>,
  ) {}

  async create(userId: number, dto: CrossDto) {
    if (userId === dto.to_user_id) {
      throw new BadRequestException('You cannot cross yourself');
    }

    const data = this.crossRepo.create({
      from_user_id: userId,
      to_user_id: dto.to_user_id,
    });

    const saved = await this.crossRepo.save(data);

    return {
      success: true,
      message: 'Cross action saved successfully',
      data: saved,
    };
  }
  // HISTORY
  async getcrossdetails(userId: number) {
    const data = await this.crossRepo.find({
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

  // DELETE CROSS
  async delete(userId: number, to_user_id: number) {
    const cross = await this.crossRepo.findOne({
      where: {
        from_user_id: userId,
        to_user_id: to_user_id,
      },
    });

    if (!cross) {
      throw new NotFoundException('Cross action not found');
    }

    await this.crossRepo.remove(cross);

    return {
      success: true,
      message: 'Cross action deleted successfully',
    };
  }
}
