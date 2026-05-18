import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friction } from './friction.entity';
import { CreateFrictionDto } from './dto/create-friction.dto';
import { UpdateFrictionDto } from './dto/update-friction.dto';

@Injectable()
export class FrictionsService {
  constructor(
    @InjectRepository(Friction)
    private readonly frictionRepo: Repository<Friction>,
  ) {}

  create(dto: CreateFrictionDto) {
    const friction = this.frictionRepo.create(dto);
    return this.frictionRepo.save(friction);
  }

  findAll() {
    return this.frictionRepo.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const friction = await this.frictionRepo.findOne({ where: { id } });
    if (!friction) throw new NotFoundException('Friction not found');
    return friction;
  }

  async update(id: number, dto: UpdateFrictionDto) {
    const friction = await this.findOne(id);
    Object.assign(friction, dto);
    return this.frictionRepo.save(friction);
  }

  async remove(id: number) {
    const friction = await this.findOne(id);
    return this.frictionRepo.remove(friction);
  }
}
