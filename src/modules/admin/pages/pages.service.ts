import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Page } from './pages.entity';
import { CreatePageDto } from './dto/create-page.dto';

import { generateSlug } from 'src/common/utility/slug.util';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  // GENERATE UNIQUE SLUG
  async generateUniqueSlug(base: string, currentId?: number): Promise<string> {
    try {
      let count = 0;

      while (true) {
        const slug = count === 0 ? base : `${base}-${count}`;

        const existing = await this.pageRepository.findOne({
          where: { slug },
        });

        if (!existing || existing.id === currentId) {
          return slug;
        }

        count++;
      }
    } catch (error) {
      console.error('SLUG ERROR:', error);

      throw new InternalServerErrorException('Slug generation failed');
    }
  }

  // CREATE PAGE
  async create(createPageDto: CreatePageDto) {
    try {
      const baseSlug = generateSlug(createPageDto.title);

      const slug = await this.generateUniqueSlug(baseSlug);

      const page = this.pageRepository.create({
        ...createPageDto,
        slug,
      });

      return await this.pageRepository.save(page);
    } catch (error) {
      console.error('CREATE PAGE ERROR:', error);

      throw new InternalServerErrorException('Failed to create page');
    }
  }

  // GET ALL PAGES
  async findAll() {
    try {
      return await this.pageRepository.find({
        order: {
          id: 'DESC',
        },
      });
    } catch (error) {
      console.error('GET ALL PAGES ERROR:', error);

      throw new InternalServerErrorException('Failed to fetch pages');
    }
  }

  // GET SINGLE PAGE
  async findOne(id: number) {
    try {
      const page = await this.pageRepository.findOne({
        where: { id },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      return page;
    } catch (error) {
      console.error('GET PAGE ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch page');
    }
  }

  // UPDATE PAGE
  async update(id: number, body: any) {
    try {
      const page = await this.pageRepository.findOne({
        where: { id },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      // AUTO SLUG UPDATE
      if (body.title) {
        const baseSlug = generateSlug(body.title);

        body.slug = await this.generateUniqueSlug(baseSlug, id);
      }

      await this.pageRepository.update(id, body);

      return await this.findOne(id);
    } catch (error) {
      console.error('UPDATE PAGE ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update page');
    }
  }

  // DELETE PAGE
  async remove(id: number) {
    try {
      const page = await this.pageRepository.findOne({
        where: { id },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      await this.pageRepository.delete(id);

      return {
        success: true,
        message: 'Page deleted successfully',
      };
    } catch (error) {
      console.error('DELETE PAGE ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete page');
    }
  }

  // GET PAGE BY SLUG
  async getBySlug(slug: string) {
    try {
      const page = await this.pageRepository.findOne({
        where: { slug },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      return page;
    } catch (error) {
      console.error('GET PAGE BY SLUG ERROR:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch page');
    }
  }
}
