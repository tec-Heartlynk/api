import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateUserPreferenceDto {
  @IsOptional()
  @IsNumber()
  looking_for?: number;

  @IsOptional()
  @IsArray()
  interests?: number[];

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  occupation?: number;

  @IsOptional()
  @IsNumber()
  religion?: number;

  @IsOptional()
  @IsNumber()
  ethnicity?: number;

  @IsOptional()
  @IsNumber()
  education?: number;

  @IsOptional()
  @IsArray()
  language?: number[];

  @IsOptional()
  @IsNumber()
  political_learning?: number;
}
