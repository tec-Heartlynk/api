import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTraitLedger } from './user_trait_ledger.entity';
import { UserTraitLedgerService } from './user-trait-ledger.service';
import { UserTraitLedgerController } from './user-trait-ledger.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserTraitLedger])],
  controllers: [UserTraitLedgerController],
  providers: [UserTraitLedgerService],
  exports: [UserTraitLedgerService],
})
export class UserTraitLedgerModule {}