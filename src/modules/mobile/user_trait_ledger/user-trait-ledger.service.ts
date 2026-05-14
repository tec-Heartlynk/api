import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserTraitLedger } from './user_trait_ledger.entity';
import { CreateUserTraitLedgerDto } from './dto/create-user-trait-ledger.dto';
import { UpdateUserTraitLedgerDto } from './dto/update-user-trait-ledger.dto';

@Injectable()
export class UserTraitLedgerService {
  constructor(
    @InjectRepository(UserTraitLedger)
    private readonly repository: Repository<UserTraitLedger>,
  ) {}

  create(dto: CreateUserTraitLedgerDto) {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  findAll() {
    return this.repository.find({
      relations: ['user', 'trait'],
    });
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({
      where: { id },
      relations: ['user', 'trait'],
    });

    if (!data) {
      throw new NotFoundException('User trait ledger not found');
    }

    return data;
  }

  async update(
    id: number,
    dto: UpdateUserTraitLedgerDto,
  ) {
    const entity = await this.findOne(id);

    Object.assign(entity, dto);

    return this.repository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);

    return this.repository.remove(entity);
  }
}