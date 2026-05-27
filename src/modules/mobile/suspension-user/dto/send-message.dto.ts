import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { MessageSender } from '../../../admin/suspension-user/suspension-message.entity';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(MessageSender)
  sender!: MessageSender;
}
