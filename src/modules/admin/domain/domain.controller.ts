import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.domainService.create(createDomainDto);
  }

  @Get()
  findAll() {
    return this.domainService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.domainService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDomainDto: UpdateDomainDto,
  ) {
    return this.domainService.update(id, updateDomainDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.domainService.remove(id);
  }
}
