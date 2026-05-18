import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserPreferenceQuestionAnswer } from './user-preference-question-answer.entity';
import { BulkUserPreferenceQuestionAnswerDto } from './dto/bulk-user-preference.dto';
import { QuizCategory } from '../../admin/quiz-question/quiz-category.enum';
import { UsersService } from '../users/users.service';
import { QuizQuestion } from '../../admin/quiz-question/quiz-question.entity';
import { CrossService } from '../cross/cross.service';

@Injectable()
export class UserPreferenceQuestionAnswerService {
  constructor(
    @InjectRepository(UserPreferenceQuestionAnswer)
    private userRepo: Repository<UserPreferenceQuestionAnswer>,
    private userService: UsersService,
    private crossService: CrossService,
    @InjectRepository(QuizQuestion)
    private questionRepo: Repository<QuizQuestion>,
  ) {}

  async create(userId: number, dto: BulkUserPreferenceQuestionAnswerDto) {
    try {
      const { cat_slug, data } = dto;

      // 🔹 1. basic validation
      if (!cat_slug || !Array.isArray(data) || data.length === 0) {
        throw new BadRequestException('Invalid request body');
      }
      const dbCount = await this.questionRepo.count({
        where: {
          category: cat_slug as QuizCategory,
          active: true,
        },
      });

      if (dbCount === 0) {
        throw new BadRequestException(
          `No active questions found for ${cat_slug}`,
        );
      }

      // 🔹 3. JSON count check
      if (data.length !== dbCount) {
        throw new BadRequestException({
          message: `${cat_slug} requires ${dbCount} questions`,
          received: data.length,
        });
      }

      const results: UserPreferenceQuestionAnswer[] = [];

      // 🔹 4. Save / Update
      for (const item of data) {
        const existing = await this.userRepo.findOne({
          where: {
            user_id: userId,
            q_id: item.q_id,
            cat_slug: cat_slug,
          },
        });

        if (existing) {
          existing.ans_id = item.ans_id;
          const updated = await this.userRepo.save(existing);
          results.push(updated);
        } else {
          const newData = this.userRepo.create({
            user_id: userId,
            q_id: item.q_id,
            ans_id: item.ans_id,
            cat_slug: cat_slug,
          });

          const saved = await this.userRepo.save(newData);

          results.push(saved);
        }
      }
      if (dto?.screen_status !== undefined) {
        await this.userService.updateStatus(userId, dto.screen_status);
      }

      return {
        status: true,
        message: `${cat_slug} data saved successfully`,
        total_saved: results.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while saving user preferences',
      );
    }
  }
  // Update Quiz Answers for a category
  async updateQuizAnswers(
    userId: number,
    dto: BulkUserPreferenceQuestionAnswerDto,
  ) {
    try {
      const { cat_slug, data } = dto;

      for (const item of data) {
        await this.userRepo.update(
          {
            user_id: userId,
            q_id: item.q_id,
            cat_slug,
          },
          {
            ans_id: item.ans_id,
          },
        );
      }

      await this.crossService.deleteByUserId(userId);

      return {
        status: true,
        message: `${cat_slug} answers updated successfully`,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getMyAllAnswers(userId: number, order: 'ASC' | 'DESC' = 'ASC') {
    try {
      const data = await this.userRepo.find({
        where: {
          user_id: userId,
        },
        order: {
          id: order,
        },
      });

      return {
        status: true,
        total: data.length,
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getMyCategoryAnswers(
    userId: number,
    cat_slug: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    try {
      const data = await this.userRepo.find({
        where: {
          user_id: userId,
          cat_slug,
        },
        order: {
          id: order,
        },
      });

      return {
        status: true,
        total: data.length,
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
