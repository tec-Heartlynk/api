import {
  Injectable,
  BadRequestException,
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
  async createUser(email: string) {
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
}
