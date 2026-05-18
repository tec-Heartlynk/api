import { IsArray, IsInt, IsOptional } from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateInterestsLifestyleDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  interests?: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fitness_level?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  travel_habits?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  work_life?: number;
}
