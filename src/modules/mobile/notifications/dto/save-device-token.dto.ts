import { IsString } from 'class-validator';

export class SaveDeviceTokenDto {
  @IsString()
  firebase_token!: string;

  @IsString()
  device_type!: string;

  @IsString()
  device_id!: string;
}
