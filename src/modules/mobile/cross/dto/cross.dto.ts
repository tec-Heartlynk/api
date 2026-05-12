import { IsNumber } from 'class-validator';

export class CrossDto {
  @IsNumber()
  to_user_id!: number;
}
