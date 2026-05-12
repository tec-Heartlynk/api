import { IsNumber } from 'class-validator';

export class StarDto {
  @IsNumber()
  to_user_id!: number;
}
