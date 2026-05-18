import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairBonus } from './repair-bonus.entity';
import { RepairBonusService } from './repair-bonus.service';
import { RepairBonusController } from './repair-bonus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RepairBonus])],
  controllers: [RepairBonusController],
  providers: [RepairBonusService],
})
export class RepairBonusModule {}
