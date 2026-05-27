import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, LessThanOrEqual } from 'typeorm';

import { ConfigService } from '@nestjs/config';

import {
  UserSuspension,
  SuspensionStatus,
} from '../../admin/suspension-user/suspension.entity';

import {
  SuspensionMessage,
  MessageSender,
} from '../../admin/suspension-user/suspension-message.entity';

import { SuspendUserDto } from './dto/suspend-user.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class SuspensionService {
  constructor(
    @InjectRepository(UserSuspension)
    private readonly suspensionRepo: Repository<UserSuspension>,

    @InjectRepository(SuspensionMessage)
    private readonly messageRepo: Repository<SuspensionMessage>,

    private readonly configService: ConfigService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | Suspend User
  |--------------------------------------------------------------------------
  */

  async suspendUser(dto: SuspendUserDto) {
    /*
  |--------------------------------------------------------------------------
  | Check Existing Suspension
  |--------------------------------------------------------------------------
  */

    const existing = await this.suspensionRepo.findOne({
      where: {
        user_id: dto.user_id,
      },

      order: {
        id: 'DESC',
      },
    });

    /*
  |--------------------------------------------------------------------------
  | If Already Active
  |--------------------------------------------------------------------------
  */

    if (existing && existing.status === SuspensionStatus.ACTIVE) {
      /*
    |--------------------------------------------------------------------------
    | Make Removed
    |--------------------------------------------------------------------------
    */

      existing.status = SuspensionStatus.ACTIVE;

      await this.suspensionRepo.save(existing);

      /*
    |--------------------------------------------------------------------------
    | Save Admin Message
    |--------------------------------------------------------------------------
    */

      const message = this.messageRepo.create({
        suspension_id: existing.id,
        sender: MessageSender.ADMIN,
        message: dto.message || 'Suspension removed by admin',
      });

      await this.messageRepo.save(message);

      return {
        success: true,
        message: 'User suspension removed successfully',

        data: existing,
      };
    }

    /*
  |--------------------------------------------------------------------------
  | ENV Hours
  |--------------------------------------------------------------------------
  */

    const suspensionHours = Number(this.configService.get('SUSPENSION_HOURS'));

    /*
  |--------------------------------------------------------------------------
  | Expiry Date
  |--------------------------------------------------------------------------
  */

    const suspendedUntil = new Date(
      Date.now() + suspensionHours * 60 * 60 * 1000,
    );

    /*
  |--------------------------------------------------------------------------
  | Create Suspension
  |--------------------------------------------------------------------------
  */

    const suspension = this.suspensionRepo.create({
      user_id: dto.user_id,
      suspended_until: suspendedUntil,
      status: SuspensionStatus.ACTIVE,
    });
    /*
  |--------------------------------------------------------------------------
  | First Admin Message
  |--------------------------------------------------------------------------
  */

    const firstMessage = this.messageRepo.create({
      suspension_id: suspension.id,
      sender: MessageSender.ADMIN,
      message: dto.message,
    });

    await this.messageRepo.save(firstMessage);

    return {
      success: true,
      message: `User suspended for ${suspensionHours} hours`,
      data: suspension,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  async sendMessage(suspensionId: number, dto: SendMessageDto) {
    const suspension = await this.suspensionRepo.findOne({
      where: {
        id: suspensionId,
        status: SuspensionStatus.ACTIVE,
      },
    });

    if (!suspension) {
      throw new NotFoundException('Suspension not found');
    }

    const message = this.messageRepo.create({
      suspension_id: suspensionId,
      sender: dto.sender,
      message: dto.message,
    });

    await this.messageRepo.save(message);

    return {
      success: true,
      data: message,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Get Suspension Chat
  |--------------------------------------------------------------------------
  */

  async getSuspensionChatdetails(suspensionId: number) {
    try {
      const suspension = await this.suspensionRepo.findOne({
        where: {
          id: suspensionId,
        },

        relations: ['messages'],

        order: {
          messages: {
            id: 'DESC',
          },
        },
      });

      if (!suspension) {
        throw new NotFoundException('Suspension not found');
      }

      /*
    |--------------------------------------------------------------------------
    | Last Admin Message
    |--------------------------------------------------------------------------
    */

      const lastAdminMessage = suspension.messages.find(
        (msg) => msg.sender === MessageSender.ADMIN,
      );

      /*
    |--------------------------------------------------------------------------
    | Last User Message
    |--------------------------------------------------------------------------
    */

      const lastUserMessage = suspension.messages.find(
        (msg) => msg.sender === MessageSender.USER,
      );

      return {
        success: true,

        data: {
          id: suspension.id,

          user_id: suspension.user_id,

          suspended_until: suspension.suspended_until,

          status: suspension.status,

          created_at: suspension.created_at,

          last_admin_message: lastAdminMessage,

          last_user_message: lastUserMessage,
        },
      };
    } catch (error) {
      console.error('GET SUSPENSION CHAT ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to fetch suspension chat');
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Check User Suspension
  |--------------------------------------------------------------------------
  */

  async checkUserSuspension(userId: number) {
    const suspension = await this.suspensionRepo.findOne({
      where: {
        user_id: userId,
        status: SuspensionStatus.ACTIVE,
      },

      relations: ['messages'],
    });

    if (suspension == null && suspension == 'ACTIVE') {
      return {
        suspended: true,
      };
    }

    return {
      suspended: true,
      data: suspension,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Remove Expired Suspensions
  |--------------------------------------------------------------------------
  */

  async removeExpiredSuspensions() {
    const expired = await this.suspensionRepo.find({
      where: {
        status: SuspensionStatus.ACTIVE,
        suspended_until: LessThanOrEqual(new Date()),
      },
    });

    for (const suspension of expired) {
      suspension.status = SuspensionStatus.REMOVED;

      await this.suspensionRepo.save(suspension);
    }

    return true;
  }

  async getAllSuspendedUsers() {
    /*
  |--------------------------------------------------------------------------
  | Get Active Suspensions
  |--------------------------------------------------------------------------
  */

    const suspensions = await this.suspensionRepo.find({
      relations: ['user', 'user.profile'],

      order: {
        id: 'DESC',
      },
    });

    /*
  |--------------------------------------------------------------------------
  | Format Response
  |--------------------------------------------------------------------------
  */

    const data = suspensions.map((suspension) => {
      /*
      |--------------------------------------------------------------------------
      | Remaining Time
      |--------------------------------------------------------------------------
      */

      const now = new Date().getTime();

      const suspendedUntil = new Date(suspension.suspended_until).getTime();

      const remainingMs = suspendedUntil - now;

      /*
      |--------------------------------------------------------------------------
      | Hours & Minutes
      |--------------------------------------------------------------------------
      */

      const hours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));

      const minutes = Math.max(
        0,
        Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)),
      );

      return {
        suspension_id: suspension.id,

        user_id: suspension.user_id,

        name: suspension.user?.profile?.name,

        status: suspension.status,

        suspended_until: suspension.suspended_until,

        remaining_time: `${hours}h ${minutes}m`,
      };
    });

    return {
      success: true,
      total: data.length,
      data,
    };
  }

  async getByUserIdSuspendedUsers(userId: number) {
    /*
  |--------------------------------------------------------------------------
  | Get Suspension
  |--------------------------------------------------------------------------
  */

    const suspension = await this.suspensionRepo.findOne({
      where: {
        user_id: userId,
        status: SuspensionStatus.ACTIVE,
      },

      relations: ['user', 'user.profile', 'messages'],
      order: {
        id: 'DESC',
      },
    });

    /*
  |--------------------------------------------------------------------------
  | No Suspension
  |--------------------------------------------------------------------------
  */

    if (!suspension) {
      return {
        success: true,
        suspended: false,
        data: null,
      };
    }

    /*
  |--------------------------------------------------------------------------
  | Remaining Time
  |--------------------------------------------------------------------------
  */

    const now = new Date().getTime();

    const suspendedUntil = new Date(suspension.suspended_until).getTime();

    const remainingMs = suspendedUntil - now;

    const hours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));

    const minutes = Math.max(
      0,
      Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)),
    );

    /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

    return {
      success: true,

      suspended: true,

      data: {
        suspension_id: suspension.id,

        user_id: suspension.user_id,

        name: suspension.user?.profile?.name,

        status: suspension.status,

        suspended_until: suspension.suspended_until,

        remaining_time: `${hours}h ${minutes}m`,

        messages: suspension.messages.map((msg) => ({
          id: msg.id,

          sender: msg.sender,

          message: msg.message,

          created_at: msg.created_at,
        })),
      },
    };
  }
}
