import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { NotificationTemplateService } from './notification-template.service';

import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { JwtAuthGuard } from '../../../modules/jwt/strategies/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/notification-templates')
export class NotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  // Create Template
  @Post()
  async create(@Body() dto: CreateNotificationTemplateDto) {
    return this.templateService.create(dto);
  }

  // Get All Templates
  @Get()
  async findAll() {
    return this.templateService.findAll();
  }

  // Get Single Template
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.templateService.findOne(+id);
  }

  // Update Template
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body()
    dto: UpdateNotificationTemplateDto,
  ) {
    return this.templateService.update(+id, dto);
  }

  // Delete Template
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.templateService.remove(+id);
  }
}
