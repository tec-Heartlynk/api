import { IsNumber, IsString } from 'class-validator';

export class SendMessageNotificationDto {
  @IsNumber()
  to_user_id!: number;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsString()
  image?: string;
}
