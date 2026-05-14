import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Trait } from '../../admin/trait/trait.entity';

@Entity('user_trait_ledger')
export class UserTraitLedger {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  trait_id!: number;

  @Column()
  trait_max_value!: number;

  @Column()
  user_trait_value!: number;

  @Column()
  normalized_value!: number;

  @ManyToOne(() => User, (user) => user.userTraitLedgers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Trait, (trait) => trait.userTraitLedgers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trait_id' })
  trait!: Trait;

}