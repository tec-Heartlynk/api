import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, Role } from './employee.entity';
import { CreateEmployeeDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  // 🆕 CREATE EMPLOYEE (OTP FLOW)
  async createEmployee(dto: CreateEmployeeDto) {
    try {
      const email = dto.email.toLowerCase().trim();

      // check existing employee
      const existing = await this.employeeRepo.findOne({
        where: { email },
      });

      if (existing) {
        throw new BadRequestException('Employee already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const employee = this.employeeRepo.create({
        email,
        name: dto.name,
        password: hashedPassword,
        role: dto.role,
        isActive: true,
        isBlocked: false,
      });

      return await this.employeeRepo.save(employee);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Employee creation failed');
    }
  }

  // 🔍 FIND EMPLOYEE
  findByEmail(email: string) {
    return this.employeeRepo.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  // 🔐 LOGIN EMPLOYEE
  async login(email: string, password: string) {
    try {
      console.log('🔐 LOGIN ATTEMPT:', { email, passwordLength: password?.length });
      
      if (!email || !password) {
        throw new UnauthorizedException('Email and password are required');
      }

      const employee = await this.findByEmail(email);
      if (!employee) {
        console.log('❌ Employee not found:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Employee found:', { id: employee.id, email: employee.email });

      if (!employee.isActive || employee.isBlocked) {
        console.log('❌ Account inactive/blocked:', { isActive: employee.isActive, isBlocked: employee.isBlocked });
        throw new UnauthorizedException('Account is inactive or blocked');
      }

      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        console.log('❌ Password mismatch for:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('✅ Password valid, generating token');

      const token = this.jwtService.sign({
        id: employee.id,
        email: employee.email,
        role: employee.role,
      });

      return {
        success: true,
        message: 'Login successful',
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        },
        token,
      };
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error?.message || error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Login failed: ' + (error?.message || 'Unknown error'));
    }
  }
}
