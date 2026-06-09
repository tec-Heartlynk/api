import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Faq } from './faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto) {
    const faq = this.faqRepo.create(createFaqDto);
    return this.faqRepo.save(faq);
  }

  async findAll() {
    return this.faqRepo.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const faq = await this.faqRepo.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto) {
    const faq = await this.findOne(id);

    Object.assign(faq, updateFaqDto);

    return this.faqRepo.save(faq);
  }

  async remove(id: number) {
    const faq = await this.findOne(id);

    await this.faqRepo.remove(faq);

    return {
      message: 'FAQ deleted successfully',
    };
  }
}
