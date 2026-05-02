import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QuizQuestion } from './quiz-question.entity';
import { QuizOption } from './quiz-option.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizCategory } from './quiz-category.enum';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,

    @InjectRepository(QuizOption)
    private readonly optionRepo: Repository<QuizOption>,
  ) {}

  // 🔹 CREATE
  async create(dto: CreateQuizDto) {
    try {
      // manual validation (extra safety)
      if (!dto.question) {
        throw new BadRequestException('Question is required');
      }

      if (!dto.options || dto.options.length === 0) {
        throw new BadRequestException('At least one option is required');
      }

      const question = new QuizQuestion();
      question.question = dto.question;
      question.category = dto.category;

      question.options = dto.options.map((opt) => {
        if (!opt.option_name) {
          throw new BadRequestException('Option name is required');
        }
        const option = new QuizOption();
        option.option_name = opt.option_name;
        return option;
      });

      return await this.questionRepo.save(question);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('CREATE ERROR:', error);
      throw error;

      //throw new InternalServerErrorException('Failed to create question');
    }
  }

  // 🔹 GET ALL
  async findAll(order: 'ASC' | 'DESC' = 'DESC') {
    try {
      return await this.questionRepo.find({
        relations: ['options'],
        order: { id: order },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch questions');
    }
  }

  // 🔹 GET BY CATEGORY
  async findByCategory(category: QuizCategory, order: 'ASC' | 'DESC' = 'DESC') {
    try {
      if (!category) {
        throw new BadRequestException('Category is required');
      }

      return await this.questionRepo.find({
        where: { category },
        relations: ['options'],
        order: { id: order },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch by category');
    }
  }

  // 🔹 GET ONE
  async findOne(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const data = await this.questionRepo.findOne({
        where: { id },
        relations: ['options'],
      });

      if (!data) {
        throw new NotFoundException('Question not found');
      }

      return data;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch question');
    }
  }

  // 🔹 UPDATE
  async update(id: number, dto: CreateQuizDto) {
    try {
      const question = await this.findOne(id);

      if (!dto.question) {
        throw new BadRequestException('Question is required');
      }

      if (!dto.options || dto.options.length === 0) {
        throw new BadRequestException('At least one option is required');
      }

      question.question = dto.question;
      question.category = dto.category;

      // delete old options
      await this.optionRepo.delete({ question: { id } });

      // add new options
      question.options = dto.options.map((opt) => {
        if (!opt.option_name) {
          throw new BadRequestException('Option name is required');
        }
        const option = new QuizOption();
        option.option_name = opt.option_name;
        return option;
      });

      return await this.questionRepo.save(question);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update question');
    }
  }

  // 🔹 DELETE
  async remove(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const res = await this.questionRepo.delete(id);

      if (res.affected === 0) {
        throw new NotFoundException('Question not found');
      }

      return { message: 'Deleted successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete question');
    }
  }
}
