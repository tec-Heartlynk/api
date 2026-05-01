import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryQuestionOption } from './category-question-option.entity';
import { CreateCategoryQuestionOptionDto } from './dto/create-category-question-option.dto';
import { UpdateCategoryQuestionOptionDto } from './dto/update-category-question-option.dto';

@Injectable()
export class CategoryQuestionOptionService {
  constructor(
    @InjectRepository(CategoryQuestionOption)
    private repo: Repository<CategoryQuestionOption>,
  ) {}

  // CREATE
  async create(dto: CreateCategoryQuestionOptionDto) {
    try {
      const data = this.repo.create(dto);
      return await this.repo.save(data);
    } catch (error) {
      console.error('CREATE ERROR:', error);
      throw new InternalServerErrorException('Failed to create option');
    }
  }

  // READ ALL
  async findAll() {
    try {
      return await this.repo.find({
        order: { sort_order: 'ASC' },
      });
    } catch (error) {
      console.error('FIND ALL ERROR:', error);
      throw new InternalServerErrorException('Failed to fetch options');
    }
  }

  // READ ONE
  async findOne(id: number) {
    try {
      const data = await this.repo.findOne({ where: { id } });

      if (!data) {
        throw new NotFoundException(`Option with ID ${id} does not exist`);
      }

      return data;
    } catch (error) {
      console.error('FIND ONE ERROR:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch option');
    }
  }

  // UPDATE (PATCH recommended)
  async update(id: number, dto: UpdateCategoryQuestionOptionDto) {
    try {
      const data = await this.findOne(id);
      Object.assign(data, dto);
      return await this.repo.save(data);
    } catch (error) {
      console.error('UPDATE ERROR:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update option');
    }
  }

  // DELETE
  async remove(id: number) {
    try {
      const data = await this.findOne(id);
      return await this.repo.remove(data);
    } catch (error) {
      console.error('DELETE ERROR:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete option');
    }
  }
}
