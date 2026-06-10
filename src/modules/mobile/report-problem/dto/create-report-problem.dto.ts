import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportProblemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
}
