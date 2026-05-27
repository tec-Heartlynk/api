import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { MessageSender } from '../suspension-message.entity';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(MessageSender)
  sender!: MessageSender;
}
