import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FrictionsService } from './frictions.service';
import { CreateFrictionDto } from './dto/create-friction.dto';
import { UpdateFrictionDto } from './dto/update-friction.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@Controller('admin/friction')
@UseGuards(JwtAuthGuard)
export class FrictionsController {
  constructor(private readonly frictionsService: FrictionsService) {}

  @Post()
  create(@Body() dto: CreateFrictionDto) {
    return this.frictionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.frictionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.frictionsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFrictionDto) {
    return this.frictionsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.frictionsService.remove(Number(id));
  }
}
