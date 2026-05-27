import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/page')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // CREATE PAGE
  @Post()
  async create(@Body() body: any) {
    return await this.pagesService.create(body);
  }

  // GET ALL PAGES
  @Get()
  async findAll() {
    return await this.pagesService.findAll();
  }

  // GET PAGE BY SLUG
  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return await this.pagesService.getBySlug(slug);
  }

  // GET SINGLE PAGE
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pagesService.findOne(id);
  }

  // UPDATE PAGE
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return await this.pagesService.update(id, body);
  }

  // DELETE PAGE
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.pagesService.remove(id);
  }
}
