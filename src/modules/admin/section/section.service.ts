import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Section } from './section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private sectionRepo: Repository<Section>,
  ) {}

  // CREATE
  async create(dto: CreateSectionDto) {
    try {
      const existing = await this.sectionRepo.findOne({
        where: {
          name: dto.name,
        },
      });

      if (existing) {
        throw new ConflictException('Section name already exists');
      }

      const section = this.sectionRepo.create(dto);

      return await this.sectionRepo.save(section);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // READ ALL
  async findAll() {
    try {
      return await this.sectionRepo.find();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // READ ONE
  async findOne(id: number) {
    try {
      const section = await this.sectionRepo.findOne({
        where: { id },
      });

      if (!section) {
        throw new NotFoundException('Section not found');
      }

      return section;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // UPDATE
  async update(id: number, dto: UpdateSectionDto) {
    try {
      const section = await this.findOne(id);

      // duplicate check except current row
      if (dto.name) {
        const existing = await this.sectionRepo
          .createQueryBuilder('section')
          .where('section.name = :name', { name: dto.name })
          .andWhere('section.id != :id', { id })
          .getOne();

        if (existing) {
          throw new ConflictException('Section name already exists');
        }
      }

      Object.assign(section, dto);

      return await this.sectionRepo.save(section);
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // SOFT DELETE
  // DELETE
  async remove(id: number) {
    try {
      const section = await this.findOne(id);

      await this.sectionRepo.remove(section);

      return {
        success: true,
        message: 'Section deleted successfully',
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  // RESTORE
  async restore(id: number) {
    try {
      await this.sectionRepo.restore(id);

      return {
        success: true,
        message: 'Section restored successfully',
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
