import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RepairBonusService } from './repair-bonus.service';
import { CreateRepairBonusDto } from './dto/create-repair-bonus.dto';
import { UpdateRepairBonusDto } from './dto/update-repair-bonus.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('admin/repair-bonus')
@UseGuards(JwtAuthGuard)
export class RepairBonusController {
  constructor(private readonly service: RepairBonusService) {}

  @Post()
  create(@Body() dto: CreateRepairBonusDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateRepairBonusDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(Number(id));
  }
}
