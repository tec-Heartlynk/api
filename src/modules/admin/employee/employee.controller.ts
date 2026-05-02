import { Controller, Post, Get, Req, UseGuards, Body } from '@nestjs/common';
import { EmployeesService } from './employee.service';
import { JwtAuthGuard } from  '../../jwt/strategies/jwt-auth.guard' // './../mobile/auth/strategies/jwt-auth.guard';
import { LoginEmployeeDto } from './dto/login.dto';
import { CreateEmployeeDto } from './dto/register.dto';

@Controller('admin/employee')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  // � EMPLOYEE LOGIN FOR ADMIN
  @Post('login')
  async login(@Body() dto: LoginEmployeeDto) { console.log(dto.email, dto.password);
    return this.employeesService.login(dto.email, dto.password);
  }

  // 👤 GET LOGGED-IN USER PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.employeesService.findByEmail(req.user.email);
  }
}