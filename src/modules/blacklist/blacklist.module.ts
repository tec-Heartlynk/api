import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from './blacklist.entity';
import { BlacklistService } from './blacklist.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlacklistedToken])],
  providers: [BlacklistService],
  exports: [BlacklistService],
})
export class BlacklistModule {}
