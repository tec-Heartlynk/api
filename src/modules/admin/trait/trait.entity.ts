import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { UserTraitLedger } from '../../mobile/user_trait_ledger/user_trait_ledger.entity';
import { Domain } from '../domain/domain.entity';

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

  @ManyToOne(() => Domain)
  @JoinColumn({ name: 'domain_id' })
  domain!: Domain;

  @OneToMany(
    () => UserTraitLedger,
    (userTraitLedger) => userTraitLedger.trait,
  )
  userTraitLedgers!: UserTraitLedger[];
}
