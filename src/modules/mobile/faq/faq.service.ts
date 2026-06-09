import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Faq } from '../../admin/faq/faq.entity';

@Injectable()
export class FaqmobileService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepo: Repository<Faq>,
  ) {}

  async findAll() {
    return this.faqRepo.find({
      order: {
        id: 'DESC',
      },
    });
  }
}
