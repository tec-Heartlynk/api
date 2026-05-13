import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './user-preference.entity';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UpdateUserExtraPreferenceDto } from './dto/update-user-extar-preference.dto';
import { UsersService } from '../users/users.service';
import { CrossService } from '../cross/cross.service';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectRepository(UserPreference)
    private repo: Repository<UserPreference>,
    private userService: UsersService,
    private crossService: CrossService,
  ) {}

  // ✅ CREATE or UPDATE (UPSERT)
  async create(user_id: number, dto: CreateUserPreferenceDto) {
    const existing = await this.repo.findOne({ where: { user_id } });

    if (existing) {
      await this.repo.update({ user_id }, dto);
      return this.findByUser(user_id);
    }

    const data = this.repo.create({
      ...dto,
      user_id,
    });

    const saved = await this.repo.save(data);

    if (dto.screen_status !== undefined) {
      await this.userService.updateStatus(user_id, dto.screen_status);
    }

    return saved;
  }

  // ⚠️ OPTIONAL: Admin only (otherwise remove this API)
  async findAll() {
    return this.repo.find();
  }

  // ✅ Get logged-in user preference
  async findByUser(user_id: number) {
    const data = await this.repo.findOne({ where: { user_id } });

    if (!data) {
      throw new NotFoundException('Preferences not found');
    }

    return data;
  }

  // ✅ Safe update
  async update(user_id: number, dto: UpdateUserPreferenceDto) {
    const existing = await this.repo.findOne({ where: { user_id } });

    if (!existing) {
      throw new NotFoundException('Preferences not found');
    }

    await this.repo.update({ user_id }, dto);
    await this.crossService.deleteByUserId(user_id);

    return this.findByUser(user_id);
  }

  // Update Extra Preferences

  async updateExtraPreferences(
    id: number,
    user_id: number,
    dto: UpdateUserExtraPreferenceDto,
  ) {
    const existing = await this.repo.findOne({
      where: { id, user_id }, // 🔥 BOTH check
    });

    if (!existing) {
      throw new NotFoundException('Preferences not found');
    }

    const updated = this.repo.merge(existing, dto);
    const saved = await this.repo.save(updated);

    if (dto.screen_status !== undefined) {
      await this.userService.updateStatus(user_id, dto.screen_status);
    }
    await this.crossService.deleteByUserId(user_id);

    return saved;
  }

  // ✅ Better delete
  async remove(user_id: number) {
    const existing = await this.repo.findOne({ where: { user_id } });

    if (!existing) {
      throw new NotFoundException('Preferences not found');
    }

    await this.repo.delete({ user_id });

    return { message: 'Deleted successfully' };
  }
}
