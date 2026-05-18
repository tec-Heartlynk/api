import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFrictionDto {
  @IsString()
  @IsNotEmpty()
  friction_area!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  trait_a_id!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  trait_b_id!: number;

  @IsString()
  @IsNotEmpty()
  trigger_name!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  multiplier!: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  area_weight!: number;
}
