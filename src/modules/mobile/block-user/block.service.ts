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
import { User } from '../users/user.entity';

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

  async create(userId: number, blockedUserId: number) {
    try {
      if (userId === blockedUserId) {
        throw new BadRequestException('You cannot block yourself');
      }

      const userExists = await this.userRepository.findOne({
        where: { id: blockedUserId },
      });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const alreadyBlocked = await this.blockRepository.findOne({
        where: {
          user_id: userId,
          blocked_user_id: blockedUserId,
        },
      });

      if (alreadyBlocked) {
        throw new ConflictException('User already blocked');
      }

      const block = this.blockRepository.create({
        user_id: userId,
        blocked_user_id: blockedUserId,
      });

      await this.blockRepository.save(block);

      return {
        success: true,
        message: 'User blocked successfully',
      };
    } catch (error) {
      console.error('BLOCK USER ERROR:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to block user');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET MY BLOCK LIST
  |--------------------------------------------------------------------------
  */

  async findAll(userId: number) {
    try {
      const blockedUsers = await this.blockRepository.find({
        where: {
          user_id: userId,
        },
        relations: ['blockedUser'],
        order: {
          id: 'DESC',
        },
      });

      return {
        success: true,
        data: blockedUsers,
      };
    } catch (error) {
      console.error('GET BLOCK LIST ERROR:', error);

      throw new InternalServerErrorException('Failed to fetch blocked users');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE BLOCK
  |--------------------------------------------------------------------------
  */

  async findOne(userId: number, blockedUserId: number) {
    try {
      const block = await this.blockRepository.findOne({
        where: {
          user_id: userId,
          blocked_user_id: blockedUserId,
        },
        relations: ['blockedUser'],
      });

      if (!block) {
        throw new NotFoundException('Blocked user not found');
      }

      return {
        success: true,
        data: block,
      };
    } catch (error) {
      console.error('GET SINGLE BLOCK ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch blocked user');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UNBLOCK USER
  |--------------------------------------------------------------------------
  */

  async remove(userId: number, blockedUserId: number) {
    try {
      const block = await this.blockRepository.findOne({
        where: {
          user_id: userId,
          blocked_user_id: blockedUserId,
        },
      });

      if (!block) {
        throw new NotFoundException('Blocked user not found');
      }

      await this.blockRepository.remove(block);

      return {
        success: true,
        message: 'User unblocked successfully',
      };
    } catch (error) {
      console.error('UNBLOCK USER ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to unblock user');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | COMMON REUSABLE CHECK
  |--------------------------------------------------------------------------
  */

  async isBlocked(currentUserId: number, targetUserId: number) {
    try {
      const block = await this.blockRepository
        .createQueryBuilder('block')
        .where(
          `
          (block.user_id = :currentUserId
          AND block.blocked_user_id = :targetUserId)

          OR

          (block.user_id = :targetUserId
          AND block.blocked_user_id = :currentUserId)
        `,
          {
            currentUserId,
            targetUserId,
          },
        )
        .getOne();

      return !!block;
    } catch (error) {
      console.error('CHECK BLOCK STATUS ERROR:', error);

      throw new InternalServerErrorException('Failed to check block status');
    }
  }
}
