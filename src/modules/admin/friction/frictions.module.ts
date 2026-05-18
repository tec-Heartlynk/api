import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friction } from './friction.entity';
import { FrictionsService } from './frictions.service';
import { FrictionsController } from './frictions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Friction])],
  controllers: [FrictionsController],
  providers: [FrictionsService],
})
export class FrictionsModule {}
