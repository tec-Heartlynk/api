import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTraitLedgerDto } from './create-user-trait-ledger.dto';

export class UpdateUserTraitLedgerDto extends PartialType(
  CreateUserTraitLedgerDto,
) {}