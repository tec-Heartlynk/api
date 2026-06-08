import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { UserSuspension } from './suspension.entity';

export enum MessageSender {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('suspension_messages')
export class SuspensionMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  suspension_id!: number;

  @ManyToOne(() => UserSuspension, (suspension) => suspension.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'suspension_id',
  })
  suspension!: UserSuspension;

  /*
  |--------------------------------------------------------------------------
  | Sender
  |--------------------------------------------------------------------------
  */

  @Column({
    type: 'enum',
    enum: MessageSender,
    default: MessageSender.ADMIN,
  })
  sender!: MessageSender;

  /*
  |--------------------------------------------------------------------------
  | Message
  |--------------------------------------------------------------------------
  */

  @Column({
    type: 'text',
  })
  message!: string;

  @CreateDateColumn()
  created_at!: Date;
}
