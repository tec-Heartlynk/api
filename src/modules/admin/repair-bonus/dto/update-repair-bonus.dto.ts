import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairBonusDto } from './create-repair-bonus.dto';

export class UpdateRepairBonusDto extends PartialType(CreateRepairBonusDto) {}
