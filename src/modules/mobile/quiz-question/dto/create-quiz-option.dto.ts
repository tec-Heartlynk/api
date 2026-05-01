import { IsString, IsNotEmpty } from 'class-validator';

export class CreateQuizOptionDto {
  @IsString()
  @IsNotEmpty()
  option_name!: string;
}
