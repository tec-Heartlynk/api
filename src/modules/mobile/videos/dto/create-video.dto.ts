import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVideoDto {
  @IsOptional()
  @IsString()
  video_verified?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  screen_status?: number;
}
