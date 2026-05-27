import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SuspendUserDto {
  @IsNumber()
  user_id!: number;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
