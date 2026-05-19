import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAdminVideoDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'Pending Verification',
    'Verified',
    'Failed Verification',
    'Manual Review Required',
  ])
  video_verified!: string;
}
