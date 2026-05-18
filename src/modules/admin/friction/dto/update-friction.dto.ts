import { PartialType } from '@nestjs/mapped-types';
import { CreateFrictionDto } from './create-friction.dto';

export class UpdateFrictionDto extends PartialType(CreateFrictionDto) {}
