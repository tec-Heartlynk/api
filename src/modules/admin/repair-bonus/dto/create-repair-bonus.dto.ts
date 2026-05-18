import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRepairBonusDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  repair_trait!: number;

  @IsString()
  @IsNotEmpty()
  meaning!: string;
}
