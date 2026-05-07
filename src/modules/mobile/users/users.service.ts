import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // 🆕 CREATE USER (OTP FLOW)
  async createUser(email: string, screen_status: number) {
    try {
      email = email.toLowerCase().trim();

      // check existing user
      const existing = await this.userRepo.findOne({
        where: { email },
      });

      if (existing) {
        return existing; // already user exists, return same
      }

      const user = this.userRepo.create({
        email,
        role: Role.USER,
        isActive: true,
        isBlocked: false,
        status: screen_status,
      });

      return await this.userRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException('User creation failed');
    }
  }

  // 🔍 FIND USER
  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  // 🔍 FIND USER
  findById(id: number) {
    return this.userRepo.findOne({
      where: { id: id },
    });
  }

  async updateStatus(userId: number, status: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;

    return this.userRepo.save(user);
  }
}
