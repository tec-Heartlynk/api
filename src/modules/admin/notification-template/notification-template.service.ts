import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { NotificationTemplate } from './notification-template.entity';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepo: Repository<NotificationTemplate>,
  ) {}

  async create(data: any) {
    try {
      const template = this.templateRepo.create(data);

      return await this.templateRepo.save(template);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException(
          `Notification template with type '${data.type}' already exists.`,
        );
      }

      throw new InternalServerErrorException(
        'Failed to create notification template',
      );
    }
  }

  async findAll() {
    return this.templateRepo.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const template = await this.templateRepo.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: number, data: any) {
    await this.findOne(id);

    await this.templateRepo.update(id, data);

    return this.findOne(id);
  }

  async remove(id: number) {
    const template = await this.findOne(id);

    return this.templateRepo.remove(template);
  }

  async getByType(type: string) {
    return this.templateRepo.findOne({
      where: {
        type,
        status: true,
      },
    });
  }
}
