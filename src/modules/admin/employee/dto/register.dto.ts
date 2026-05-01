import {
  IsEmail,
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';
import { Role } from '../employee.entity';

export class CreateEmployeeDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @Type(() => String)
  @IsString()
  password!: string;

  @IsEnum(Role)
  role: Role = Role.ADMIN; // default ADMIN


}