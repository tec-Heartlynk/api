import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateQuizOptionDto {
  @IsString()
  @IsNotEmpty()
  option_name!: string;
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
