import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Page } from '../../admin/pages/pages.entity';

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

  // GET SINGLE PAGE
  async findOne(id: number) {
    try {
      const page = await this.pageRepository.findOne({
        where: {
          id,
          status: 'published',
        },
      });

      if (!page) {
        throw new NotFoundException('Published page not found');
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

  // GET PAGE BY SLUG
  async getBySlug(slug: string) {
    try {
      const page = await this.pageRepository.findOne({
        where: {
          slug,
          status: 'published',
        },
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
