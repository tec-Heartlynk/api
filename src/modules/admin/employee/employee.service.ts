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
      if (!email || !password) {
        throw new UnauthorizedException('Email and password are required');
      }

      const employee = await this.findByEmail(email);

      if (!employee) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!employee.isActive || employee.isBlocked) {
        throw new UnauthorizedException('Account is inactive or blocked');
      }

      const isPasswordValid = await bcrypt.compare(password, employee.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // ✅ UPDATE LAST LOGIN
      employee.last_login = new Date();

      await this.employeeRepo.save(employee);

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
          last_login: employee.last_login,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  // ✅ GET ALL ADMINS
  async getAllAdmins() {
    return this.employeeRepo.find({
      order: {
        id: 'DESC',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isBlocked: true,
        last_login: true,
        createdAt: true,
      },
    });
  }

  // ✅ GET SINGLE ADMIN
  async getAdmin(id: number) {
    const admin = await this.employeeRepo.findOne({
      where: { id },
    });

    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    return admin;
  }

  // ✅ UPDATE ADMIN
  async updateAdmin(id: number, dto: Partial<CreateEmployeeDto>) {
    const admin = await this.getAdmin(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(admin, dto);

    return this.employeeRepo.save(admin);
  }

  // ✅ DELETE ADMIN
  async deleteAdmin(id: number) {
    const admin = await this.getAdmin(id);

    await this.employeeRepo.remove(admin);

    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  }

  // ✅ BLOCK/UNBLOCK ADMIN
  async toggleBlock(id: number) {
    const admin = await this.getAdmin(id);

    admin.isBlocked = !admin.isBlocked;

    await this.employeeRepo.save(admin);

    return {
      success: true,
      isBlocked: admin.isBlocked,
    };
  }
}
