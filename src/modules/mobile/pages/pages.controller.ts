import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { PagesService } from './pages.service';
import { Public } from '../../jwt/strategies/public.decorator';

@Controller('mobile/page')
export class MobilePagesController {
  constructor(private readonly pagesService: PagesService) {}

  // GET PAGE BY ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pagesService.findOne(id);
  }

  // GET PAGE BY SLUG
  @Public()
  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return await this.pagesService.getBySlug(slug);
  }
}
