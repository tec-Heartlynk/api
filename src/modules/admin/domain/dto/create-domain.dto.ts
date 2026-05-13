import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string;
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'domain_weight must be a float number',
    },
  )
  domain_weight!: number;
}
