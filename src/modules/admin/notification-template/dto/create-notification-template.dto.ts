import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
