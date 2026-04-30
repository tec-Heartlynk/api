import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOptionCategoryDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
