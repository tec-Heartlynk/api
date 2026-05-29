import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { EmployeesService } from './employee.service';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { LoginEmployeeDto } from './dto/login.dto';

import { CreateEmployeeDto } from './dto/register.dto';

import { Public } from '../../jwt/strategies/public.decorator';

import { Roles } from '../../../common/decorators/roles.decorator';

import { RolesGuard } from '../../../common/guards/admin-roles.guard';

import { Role } from './employee.entity';

@Controller('admin/employee')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  // ✅ LOGIN
  @Post('login')
  @Public()
  async login(@Body() dto: LoginEmployeeDto) {
    return this.employeesService.login(dto.email, dto.password);
  }

  // ✅ PROFILE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.employeesService.findByEmail(req.user.email);
  }

  // ✅ CREATE ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('create')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.createEmployee(dto);
  }

  // ✅ GET ALL ADMINS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get()
  getAll() {
    return this.employeesService.getAllAdmins();
  }

  // ✅ GET SINGLE ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get(':id')
  getOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.getAdmin(id);
  }

  // ✅ UPDATE ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: Partial<CreateEmployeeDto>,
  ) {
    return this.employeesService.updateAdmin(id, dto);
  }

  // ✅ DELETE ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.deleteAdmin(id);
  }

  // ✅ BLOCK / UNBLOCK
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/toggle-block')
  toggleBlock(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.employeesService.toggleBlock(id);
  }
}
