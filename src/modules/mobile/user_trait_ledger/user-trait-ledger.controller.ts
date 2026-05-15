import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UserTraitLedgerService } from './user-trait-ledger.service';
import { CreateUserTraitLedgerDto } from './dto/create-user-trait-ledger.dto';
import { UpdateUserTraitLedgerDto } from './dto/update-user-trait-ledger.dto';

@Controller('user-trait-ledger')
export class UserTraitLedgerController {
  constructor(
    private readonly service: UserTraitLedgerService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateUserTraitLedgerDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserTraitLedgerDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }
}