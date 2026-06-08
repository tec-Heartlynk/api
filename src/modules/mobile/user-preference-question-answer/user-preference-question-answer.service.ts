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
import { QuizOption } from '../../admin/quiz-question/quiz-option.entity';
import { UserTraitLedgerService } from '../user_trait_ledger/user-trait-ledger.service';
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

    @InjectRepository(QuizOption)
    private optionRepo: Repository<QuizOption>,

    private userTraitLedgerService: UserTraitLedgerService,
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
      if(cat_slug === 'lifestyle') {
        // Calculate and store user trait ledger
        const ledgerData = await this.calculateLedgerData(userId);
        await this.userTraitLedgerService.storeUserTraitLedger(
          userId,
          ledgerData,
        );
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
      // Calculate and store user trait ledger
      const ledgerData = await this.calculateLedgerData(userId);
      await this.userTraitLedgerService.storeUserTraitLedger(
        userId,
        ledgerData,
      );

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

  async calculateLedgerData(
    userId: number,
  ): Promise<{
    traitId: number;
    traitMaxValue: number;
    userTraitValue: number;
    normalizedValue: number;
  }[]> {
    // Get all user's answers for this category
    const userAnswers = await this.userRepo.find({
      where: {
        user_id: userId
      },
    });

    if (userAnswers.length === 0) {
      return [];
    }

    // Get the answer IDs from user's answers
    const userAnswerIds = userAnswers.map((a) => a.ans_id);
    
    // Get all user's selected options
    const userSelectedOptions = await this.optionRepo.find({
      where: userAnswerIds.map((id) => ({ id })),
    });

    // Get all questions for this category
    const questionsInCategory = await this.questionRepo.find({
      where: {
        active: true,
      },
      relations: ['options'],
    });
    // Get all possible options for this category
    const allOptionsInCategory = questionsInCategory.flatMap((q) => q.options);
    
    // Map to track trait values
    const traitMap: Map<
      number,
      { max_value: number; user_value: number }
    > = new Map();

    // Calculate trait_max_value: sum all weights for each trait across all options
    for (const option of allOptionsInCategory) {
      const traits = [
        {
          id: option.primary_trait_id,
          value: option.primary_trait_value,
        },
        {
          id: option.secondary_trait_id,
          value: option.secondary_trait_value,
        },
        { id: option.supporting_trait_id, value: option.supporting_trait_value },
      ];
      
      for (const trait of traits) { 
        if (trait.id > 0) {
          if (!traitMap.has(trait.id)) {
            traitMap.set(trait.id, { max_value: 0, user_value: 0 });
          }
          const current = traitMap.get(trait.id)!;
          current.max_value += trait.value;
        }
      }
    }

    // Calculate user_trait_value: sum only from user's selected options
    for (const option of userSelectedOptions) {
      const traits = [
        {
          id: option.primary_trait_id,
          value: option.primary_trait_value,
        },
        {
          id: option.secondary_trait_id,
          value: option.secondary_trait_value,
        },
        { id: option.supporting_trait_id, 
          value: option.supporting_trait_value 
        },
      ];
      

      for (const trait of traits) { 
        if (trait.id > 0) {
          if (!traitMap.has(trait.id)) {
            traitMap.set(trait.id, { max_value: 0, user_value: 0 });
          }
          const current = traitMap.get(trait.id)!;
          current.user_value += trait.value;
        }
      }
    }

    // Build ledger data array with normalized values
    const ledgerData: {
      traitId: number;
      traitMaxValue: number;
      userTraitValue: number;
      normalizedValue: number;
    }[] = [];

    for (const [traitId, values] of traitMap.entries()) {
      if (values.max_value > 0) {
        ledgerData.push({
          traitId,
          traitMaxValue: values.max_value,
          userTraitValue: values.user_value,
          normalizedValue: values.max_value === 0 ? 0 : Math.round(
            (values.user_value / values.max_value) * 100,
          ),
        });
      }
    }

    return ledgerData;
  }

  async callLedger(userId: number) {
    const ledgerData = await this.calculateLedgerData(userId);
    
    return this.userTraitLedgerService.storeUserTraitLedger(
      userId,
      ledgerData,
    );
  }  

  async calculateCompatibilityScores(userId1: number, userId2: number) {
    
    return this.userTraitLedgerService.getDomainCompatibilityScores(
      userId1,
      userId2,
    );
  } 
}
