import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, LessThanOrEqual } from 'typeorm';

import { ConfigService } from '@nestjs/config';

import { UserSuspension, SuspensionStatus } from './suspension.entity';

import { SuspensionMessage, MessageSender } from './suspension-message.entity';

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
| If Record Exists -> TOGGLE STATUS
|--------------------------------------------------------------------------
*/

    if (existing) {
      /*
    |--------------------------------------------------------------------------
    | NULL or REMOVED -> ACTIVE
    |--------------------------------------------------------------------------
    */

      if (
        existing.status === null ||
        existing.status === SuspensionStatus.REMOVED
      ) {
        existing.status = SuspensionStatus.ACTIVE;

        existing.suspended_until = suspendedUntil;
      } else {

      /*
    |--------------------------------------------------------------------------
    | ACTIVE -> REMOVED
    |--------------------------------------------------------------------------
    */
        existing.status = SuspensionStatus.REMOVED;
      }

      await this.suspensionRepo.save(existing);

      /*
    |--------------------------------------------------------------------------
    | Save Admin Message
    |--------------------------------------------------------------------------
    */

      const message = this.messageRepo.create({
        suspension_id: existing.id,
        sender: MessageSender.ADMIN,
        message:
          dto.message || `Suspension status changed to ${existing.status}`,
      });

      await this.messageRepo.save(message);

      return {
        success: true,
        message: `User suspension status changed to ${existing.status}`,
        data: existing,
      };
    }

    /*
|--------------------------------------------------------------------------
| Create First Suspension Record
|--------------------------------------------------------------------------
*/

    const suspension = this.suspensionRepo.create({
      user_id: dto.user_id,

      suspended_until: suspendedUntil,

      status: SuspensionStatus.ACTIVE,
    });

    await this.suspensionRepo.save(suspension);

    /*
|--------------------------------------------------------------------------
| First Admin Message
|--------------------------------------------------------------------------
*/

    const firstMessage = this.messageRepo.create({
      suspension_id: suspension.id,
      sender: MessageSender.ADMIN,
      message: dto.message || 'User suspended by admin',
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
    try {
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
    } catch (error) {
      console.error('SEND MESSAGE ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to send message');
    }
  }

  /*
|--------------------------------------------------------------------------
| Get Suspension Chat
|--------------------------------------------------------------------------
*/

  async getSuspensionChat(suspensionId: number) {
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

      return {
        success: true,
        data: suspension,
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
}
