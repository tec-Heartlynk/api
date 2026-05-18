import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepairBonus } from './repair-bonus.entity';
import { CreateRepairBonusDto } from './dto/create-repair-bonus.dto';
import { UpdateRepairBonusDto } from './dto/update-repair-bonus.dto';

@Injectable()
export class RepairBonusService {
  constructor(
    @InjectRepository(RepairBonus)
    private repo: Repository<RepairBonus>,
  ) {}

  async create(dto: CreateRepairBonusDto) {
    const data = this.repo.create(dto);
    return await this.repo.save(data);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const data = await this.repo.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Repair Bonus not found');
    return data;
  }

  async update(id: number, dto: UpdateRepairBonusDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const data = await this.findOne(id);
    return await this.repo.remove(data);
  }
}
