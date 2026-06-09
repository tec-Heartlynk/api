import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../jwt/strategies/jwt-auth.guard';

import { FaqmobileService } from './faq.service';
@UseGuards(JwtAuthGuard) // 🔐 ALL ROUTES PROTECTED
@Controller('mobile/faq')
export class FaqMobileController {
  constructor(private readonly faqService: FaqmobileService) {}

  // Get All FAQ
  @Get()
  findAll() {
    return this.faqService.findAll();
  }
}
