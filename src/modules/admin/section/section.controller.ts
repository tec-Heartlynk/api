import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('admin/section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.sectionService.create(dto);
  }

  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sectionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateSectionDto) {
    return this.sectionService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.sectionService.remove(+id);
  }
}
