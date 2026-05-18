import {
  IsInt,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateUserTraitLedgerDto {
  @IsInt()
  user_id!: number;

  @IsInt()
  trait_id!: number;
  
  @IsNumber()
  @Min(0)
  trait_max_value!: number;

  @IsNumber()
  @Min(0)
  user_trait_value!: number;

  @IsNumber()
  @Min(0)
  normalized_value!: number;
}