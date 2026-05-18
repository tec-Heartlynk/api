import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateRelationGoalDto {
  @IsNotEmpty()
  @IsNumber()
  looking_for?: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  feel!: string;
}
