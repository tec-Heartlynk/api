import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @IsOptional()
  @IsNumber()
  reason?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  device_info?: string;
}
