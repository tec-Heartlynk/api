import { IsNotEmpty, IsNumber } from 'class-validator';

export class HeartDto {
  @IsNumber()
  @IsNotEmpty()
  to_user_id!: number;
}
