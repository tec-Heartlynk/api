import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../jwt/strategies/jwt-auth.guard';
import { CreateOptionCategoryDto } from './dto/create-option-category.dto';
import { UpdateOptionCategoryDto } from './dto/update-option-category.dto';
import { OptionCategoryService } from './option_category.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard) // 🔐 ALL ROUTES PROTECTED
@Controller('mobile/option-category')
export class OptionCategoryController {
  constructor(private readonly service: OptionCategoryService) {}

  // ✅ CREATE
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(@Req() req: any, @Body() dto: CreateOptionCategoryDto) {
    return this.service.create(req.user.userId, dto);
  }

  // ✅ GET ALL (NOW PROTECTED)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ✅ GET ONE (NOW PROTECTED)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // ✅ UPDATE
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOptionCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  // ✅ DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
