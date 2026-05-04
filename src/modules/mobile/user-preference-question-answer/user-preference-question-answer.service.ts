import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { CreateUserPreferenceQuestionAnswerDto } from './dto/create-user-preference-question-answer.dto';

@Injectable()
export class UserPreferenceQuestionAnswerService {
  constructor(
    @InjectRepository(UserPreferenceQuestionAnswer)
    private repo: Repository<UserPreferenceQuestionAnswer>,
  ) {}

  // ✅ CREATE (insert/update)
  async create(userId: number, dto: CreateUserPreferenceQuestionAnswerDto) {
    const existing = await this.repo.findOne({
      where: {
        user_id: userId,
        q_id: dto.q_id,
        cat_slug: dto.cat_slug,
      },
    });

    if (existing) {
      existing.ans_id = dto.ans_id;
      return this.repo.save(existing);
    }

    const data = this.repo.create({
      user_id: userId,
      ...dto,
    });

    return this.repo.save(data);
  }

  // ✅ READ ALL
  async findAll(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
  }

  // ✅ READ ONE
  async findOne(id: number, userId: number) {
    const data = await this.repo.findOne({
      where: { id, user_id: userId },
    });

    if (!data) throw new NotFoundException('Data not found');

    return data;
  }

  // ❌ DELETE
  async remove(id: number, userId: number) {
    const data = await this.findOne(id, userId);
    await this.repo.remove(data);

    return { message: 'Deleted successfully' };
  }
}
