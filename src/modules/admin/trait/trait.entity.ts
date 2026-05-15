import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserTraitLedger } from '../../mobile/user_trait_ledger/user_trait_ledger.entity';

@Entity('traits')
export class Trait {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  abr!: string;

  @Column({ type: 'text', nullable: true })
  meaning!: string;

  @Column()
  domain_id!: number;

  @OneToMany(
  () => UserTraitLedger,
  (userTraitLedger) => userTraitLedger.trait,
)
userTraitLedgers!: UserTraitLedger[];
}
