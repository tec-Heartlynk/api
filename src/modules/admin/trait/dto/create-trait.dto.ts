import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTraitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  abr!: string;

  @IsNotEmpty()
  @IsString()
  meaning?: string;

  @IsNotEmpty()
  @IsNumber()
  domain_id?: number;
}
