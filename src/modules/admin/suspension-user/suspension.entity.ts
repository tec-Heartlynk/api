import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../mobile/users/user.entity';

import { SuspensionMessage } from './suspension-message.entity';

export enum SuspensionStatus {
  ACTIVE = 'active',
  REMOVED = 'removed',
}

@Entity('user_suspensions')
export class UserSuspension {
  @PrimaryGeneratedColumn()
  id!: number;

  /*
  |--------------------------------------------------------------------------
  | User ID
  |--------------------------------------------------------------------------
  */

  @Column()
  user_id!: number;

  /*
  |--------------------------------------------------------------------------
  | User Relation
  |--------------------------------------------------------------------------
  */

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  /*
  |--------------------------------------------------------------------------
  | Suspension Expiry
  |--------------------------------------------------------------------------
  */

  @Column({
    type: 'timestamp',
  })
  suspended_until!: Date;

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  @Column({
    type: 'enum',
    enum: SuspensionStatus,
    default: SuspensionStatus.ACTIVE,
  })
  status!: SuspensionStatus;

  /*
  |--------------------------------------------------------------------------
  | Messages
  |--------------------------------------------------------------------------
  */

  @OneToMany(() => SuspensionMessage, (message) => message.suspension)
  messages!: SuspensionMessage[];

  @CreateDateColumn()
  created_at!: Date;
}
