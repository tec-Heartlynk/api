import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { SuspensionService } from './suspension.service';

@Injectable()
export class SuspensionCron {
  constructor(private readonly suspensionService: SuspensionService) {}

  /*
  |--------------------------------------------------------------------------
  | Every Hour
  |--------------------------------------------------------------------------
  */

  @Cron('0 * * * *')
  async handleExpiredSuspensions() {
    await this.suspensionService.removeExpiredSuspensions();
  }
}
