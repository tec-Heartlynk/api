import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateQuizOptionDto {
  @IsOptional()
  @IsInt()
  id?: number;
  @IsString()
  @IsNotEmpty()
  option_name!: string;

  @IsNotEmpty()
  @IsInt()
  primary_trait_id?: number;

  @IsNotEmpty()
  @IsInt()
  primary_trait_value?: number;

  @IsNotEmpty()
  @IsInt()
  secondary_trait_id?: number;

  @IsNotEmpty()
  @IsInt()
  secondary_trait_value?: number;

  @IsNotEmpty()
  @IsInt()
  supporting_trait_id?: number;

  @IsNotEmpty()
  @IsInt()
  supporting_trait_value?: number;
}
