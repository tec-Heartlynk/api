import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { TraitService } from './trait.service';
import { CreateTraitDto } from './dto/create-trait.dto';
import { UpdateTraitDto } from './dto/update-trait.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/trait')
export class TraitController {
  constructor(private readonly traitService: TraitService) {}

  @Post()
  async create(@Body() createTraitDto: CreateTraitDto) {
    try {
      return await this.traitService.create(createTraitDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating trait',
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.traitService.findAll();
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while fetching traits',
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.traitService.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while fetching trait',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTraitDto: UpdateTraitDto,
  ) {
    try {
      return await this.traitService.update(id, updateTraitDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while updating trait',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.traitService.remove(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }

      throw new InternalServerErrorException(
        'Something went wrong while deleting trait',
      );
    }
  }
}
