import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TraitService } from './trait.service';
import { TraitController } from './trait.controller';
import { Trait } from './trait.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trait])],
  controllers: [TraitController],
  providers: [TraitService],
})
export class TraitModule {}
