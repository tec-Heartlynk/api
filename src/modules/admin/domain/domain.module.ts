import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { Domain } from './domain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Domain])],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}
