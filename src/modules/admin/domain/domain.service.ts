import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Domain } from './domain.entity';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepo: Repository<Domain>,
  ) {}

  async create(createDomainDto: CreateDomainDto) {
    try {
      const domain = this.domainRepo.create(createDomainDto);
      const data = await this.domainRepo.save(domain);

      return {
        success: true,
        message: 'Domain created successfully',
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  async findAll() {
    const data = await this.domainRepo.find({
      order: {
        id: 'DESC',
      },
    });

    return {
      success: true,
      data,
    };
  }

  async findOne(id: number) {
    const domain = await this.domainRepo.findOne({
      where: { id },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    return {
      success: true,
      data: domain,
    };
  }

  async update(id: number, updateDomainDto: UpdateDomainDto) {
    try {
      const domain = await this.domainRepo.findOne({
        where: { id },
      });

      if (!domain) {
        throw new NotFoundException('Domain not found');
      }

      Object.assign(domain, updateDomainDto);

      const data = await this.domainRepo.save(domain);

      return {
        success: true,
        message: 'Domain updated successfully',
        data,
      };
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException((error as Error).message);
    }
  }

  async remove(id: number) {
    try {
      const domain = await this.domainRepo.findOne({
        where: { id },
      });

      if (!domain) {
        throw new NotFoundException('Domain not found');
      }

      await this.domainRepo.remove(domain);

      return {
        success: true,
        message: 'Domain deleted successfully',
      };
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException((error as Error).message);
    }
  }
}
