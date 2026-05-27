import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockUser } from './block.entity';
import { User } from '../../mobile/users/user.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockUser)
    private readonly blockRepository: Repository<BlockUser>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | BLOCK USER
  |--------------------------------------------------------------------------
  */

  async adminFindAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [blocks, total] = await this.blockRepository.findAndCount({
        relations: {
          user: {
            profile: true,
          },

          blockedUser: {
            profile: true,
          },
        },

        order: {
          id: 'DESC',
        },

        skip,
        take: limit,
      });

      const data = blocks.map((item) => ({
        id: item.id,

        user: {
          id: item.user?.id,

          name: item.user?.profile?.name,
        },

        blockedUser: {
          id: item.blockedUser?.id,

          name: item.blockedUser?.profile?.name,
        },
      }));

      return {
        success: true,

        data,

        pagination: {
          total,
          current_page: page,
          per_page: limit,
          total_pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('ADMIN GET BLOCK LIST ERROR:', error);

      throw new InternalServerErrorException('Failed to fetch blocked users');
    }
  }

  async adminFindOne(id: number) {
    try {
      const block = await this.blockRepository.findOne({
        where: { id },

        relations: ['user', 'blockedUser'],
      });

      if (!block) {
        throw new NotFoundException('Blocked record not found');
      }

      return {
        success: true,
        data: block,
      };
    } catch (error) {
      console.error('ADMIN GET SINGLE BLOCK ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch blocked record');
    }
  }
  async adminRemove(id: number) {
    try {
      const block = await this.blockRepository.findOne({
        where: { id },
      });

      if (!block) {
        throw new NotFoundException('Blocked record not found');
      }

      await this.blockRepository.remove(block);

      return {
        success: true,
        message: 'Blocked record removed successfully',
      };
    } catch (error) {
      console.error('ADMIN REMOVE BLOCK ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove blocked record');
    }
  }
}
