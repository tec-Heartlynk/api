import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminReportUserDto {
  @IsInt()
  @IsNotEmpty()
  to_user_id!: number;

  @IsInt()
  @IsNotEmpty()
  what_happened_id!: number;

  @IsOptional()
  @IsString()
  anything_else?: string;

  @IsOptional()
  @IsString()
  describe?: string;
}
