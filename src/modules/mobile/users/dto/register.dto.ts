import {
  IsEmail,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Role } from '../user.entity';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role: Role = Role.USER; // default USER

  
}