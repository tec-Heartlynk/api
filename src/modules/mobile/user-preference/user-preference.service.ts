import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from './user-preference.entity';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UpdateUserExtraPreferenceDto } from './dto/update-user-extar-preference.dto';
import { UpdateUserAboutPreferenceDto } from './dto/update-user-profile-preference.dto';
import { UpdateRelationGoalDto } from './dto/update-relation-goal.dto';
import { UsersService } from '../users/users.service';
import { CrossService } from '../cross/cross.service';
import { InternalServerErrorException } from '@nestjs/common';

import { Profile } from '../profile/profile.entity';
import { UpdateInterestsLifestyleDto } from './dto/update-intrests-lifestyle.dto';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectRepository(UserPreference)
    private repo: Repository<UserPreference>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

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
  async findByUser(userId: number) {
    try {
      const preference = await this.repo.findOne({
        where: {
          user: {
            id: userId,
          },
        },
      });

      // ✅ DO NOT THROW ERROR
      if (!preference) {
        return null;
      }

      return preference;
    } catch (error) {
      console.error('FIND PREFERENCE ERROR:', error);

      throw new InternalServerErrorException(
        'Failed to fetch user preferences',
      );
    }
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

  // ✅ update current user preference and profile

  async updateAbout(userId: number, dto: UpdateUserAboutPreferenceDto) {
    try {
      // =========================
      // GET EXISTING DATA FIRST
      // =========================

      const profile = await this.profileRepo.findOne({
        where: { user_id: userId },
      });

      const preference = await this.repo.findOne({
        where: { user_id: userId },
      });

      if (!profile || !preference) {
        throw new NotFoundException('User data not found');
      }

      // =========================
      // PROFILE MERGE (SAFE)
      // =========================

      const updatedProfile = {
        ...profile,
        name: dto.name ?? profile.name,
        dob: dto.dob ?? profile.dob,
        identity: dto.identity ?? profile.identity,
        self_describe: dto.self_describe ?? profile.self_describe,
        who_open_meeting: dto.who_open_meeting ?? profile.who_open_meeting,
      };

      await this.profileRepo.save(updatedProfile);

      // =========================
      // PREFERENCES MERGE (SAFE)
      // =========================

      const updatedPreference = {
        ...preference,
        height: dto.height ?? preference.height,
        occupation: dto.occupation ?? preference.occupation,
        religion: dto.religion ?? preference.religion,
        ethnicity: dto.ethnicity ?? preference.ethnicity,
        education: dto.education ?? preference.education,
        language: dto.language ?? preference.language,
        political_learning:
          dto.political_learning ?? preference.political_learning,
        open_to_children: dto.open_to_children ?? preference.open_to_children,
        pets: dto.pets ?? preference.pets,
        drinking: dto.drinking ?? preference.drinking,
        smoking: dto.smoking ?? preference.smoking,
        diet: dto.diet ?? preference.diet,
      };

      await this.repo.save(updatedPreference);
      await this.crossService.deleteByUserId(userId);

      return {
        success: true,
        message: 'Profile + Preferences updated safely',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  async updateRelationGoal(userId: number, dto: UpdateRelationGoalDto) {
    try {
      // =========================
      // GET EXISTING DATA FIRST
      // =========================

      const profile = await this.profileRepo.findOne({
        where: { user_id: userId },
      });

      const preference = await this.repo.findOne({
        where: { user_id: userId },
      });

      if (!profile || !preference) {
        throw new NotFoundException('User data not found');
      }

      // =========================
      // PREFERENCES MERGE (SAFE)
      // =========================

      const updatedPreference = {
        ...preference,
        looking_for: dto.looking_for ?? preference.looking_for,
        feel: dto.feel ?? preference.feel,
      };

      await this.repo.save(updatedPreference);
      await this.crossService.deleteByUserId(userId);

      return {
        success: true,
        message: 'Relation goals updated Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }

  async updateInterestsLifestyle(
    userId: number,
    dto: UpdateInterestsLifestyleDto,
  ) {
    try {
      // =========================
      // GET EXISTING DATA FIRST
      // =========================

      const profile = await this.profileRepo.findOne({
        where: { user_id: userId },
      });

      const preference = await this.repo.findOne({
        where: { user_id: userId },
      });

      if (!profile || !preference) {
        throw new NotFoundException('User data not found');
      }

      // =========================
      // PREFERENCES MERGE (SAFE)
      // =========================

      const updatedPreference = {
        ...preference,
        interests: dto.interests ?? preference.interests,
        fitness_level: dto.fitness_level ?? preference.fitness_level,
        travel_habits: dto.travel_habits ?? preference.travel_habits,
        work_life: dto.work_life ?? preference.work_life,
      };

      await this.repo.save(updatedPreference);
      await this.crossService.deleteByUserId(userId);

      return {
        success: true,
        message: 'Interests and lifestyle updated Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    }
  }
}
