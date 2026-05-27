import { IsInt } from 'class-validator';

export class CreateBlockDto {
  @IsInt()
  blocked_user_id!: number;
}
