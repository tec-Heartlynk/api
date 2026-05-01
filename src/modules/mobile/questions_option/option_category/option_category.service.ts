import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OptionCategory } from './option_category.entity';
import { CreateOptionCategoryDto } from './dto/create-option-category.dto';
import { UpdateOptionCategoryDto } from './dto/update-option-category.dto';
import { generateSlug } from 'src/common/utility/slug.util';

@Injectable()
export class OptionCategoryService {
  constructor(
    @InjectRepository(OptionCategory)
    private repo: Repository<OptionCategory>,
  ) {}

  // 🔥 UNIQUE SLUG
  async generateUniqueSlug(base: string, currentId?: number): Promise<string> {
    try {
      let count = 0;

      while (true) {
        const slug = count === 0 ? base : `${base}-${count}`;
        const existing = await this.repo.findOne({ where: { slug } });

        if (!existing || existing.id === currentId) return slug;

        count++;
      }
    } catch (error) {
      console.error('SLUG ERROR:', error);
      throw new InternalServerErrorException('Slug generation failed');
    }
  }

  // ✅ CREATE
  async create(userId: number, dto: CreateOptionCategoryDto) {
    try {
      const baseSlug = generateSlug(dto.title);
      const slug = await this.generateUniqueSlug(baseSlug);

      const data = this.repo.create({
        title: dto.title,
        slug,
        description: dto.description,
      });

      return await this.repo.save(data);
    } catch (error) {
      console.error('CREATE ERROR:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  // ✅ UPDATE
  async update(id: number, dto: UpdateOptionCategoryDto) {
    try {
      const category = await this.repo.findOne({ where: { id } });

      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      if (dto.title !== undefined) {
        category.title = dto.title;

        const baseSlug = generateSlug(dto.title);
        category.slug = await this.generateUniqueSlug(baseSlug, id);
      }

      if (dto.description !== undefined) {
        category.description = dto.description;
      }

      return await this.repo.save(category);
    } catch (error) {
      console.error('UPDATE ERROR:', error);
      throw error;
    }
  }

  // ✅ GET ALL
  async findAll() {
    try {
      return await this.repo.find({
        relations: {
          options: true, // 🔥 nested relation
        },
        order: {
          options: {
            sort_order: 'ASC',
          },
        },
      });
    } catch (error) {
      console.error('GET ALL ERROR:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  // ✅ GET ONE
  async findOne(id: number) {
    try {
      const category = await this.repo.findOne({ where: { id } });

      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      return category; // ❌ findOneByOrFail hata diya (double query avoid)
    } catch (error) {
      console.error('GET ONE ERROR:', error);
      throw error;
    }
  }

  // ✅ DELETE
  async remove(id: number) {
    try {
      const category = await this.repo.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }
      return await this.repo.remove(category);
    } catch (error) {
      throw error;
    }
  }
}
