import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Trait } from './trait.entity';

import { CreateTraitDto } from './dto/create-trait.dto';
import { UpdateTraitDto } from './dto/update-trait.dto';

@Injectable()
export class TraitService {
  constructor(
    @InjectRepository(Trait)
    private readonly traitRepo: Repository<Trait>,
  ) {}

  async create(createTraitDto: CreateTraitDto) {
    try {
      const trait = this.traitRepo.create(createTraitDto);

      const savedTrait = await this.traitRepo.save(trait);

      return {
        success: true,
        message: 'Trait created successfully',
        data: savedTrait,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating trait',
      );
    }
  }

  async findAll() {
    try {
      const traits = await this.traitRepo.find({
        order: {
          id: 'DESC',
        },
      });

      return {
        success: true,
        data: traits,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while fetching traits',
      );
    }
  }

  async findOne(id: number) {
    try {
      const trait = await this.traitRepo.findOne({
        where: {
          id,
        },
      });

      if (!trait) {
        throw new NotFoundException('Trait not found');
      }

      return {
        success: true,
        data: trait,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTraitDto: UpdateTraitDto) {
    try {
      const trait = await this.traitRepo.findOne({
        where: {
          id,
        },
      });

      if (!trait) {
        throw new NotFoundException('Trait not found');
      }

      Object.assign(trait, updateTraitDto);

      const updatedTrait = await this.traitRepo.save(trait);

      return {
        success: true,
        message: 'Trait updated successfully',
        data: updatedTrait,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const trait = await this.traitRepo.findOne({
        where: {
          id,
        },
      });

      if (!trait) {
        throw new NotFoundException('Trait not found');
      }

      await this.traitRepo.remove(trait);

      return {
        success: true,
        message: 'Trait deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
